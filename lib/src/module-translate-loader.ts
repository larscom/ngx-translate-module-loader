import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import merge from 'deepmerge';
import { forkJoin as ForkJoin, MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { IModuleTranslationOptions } from './models/module-translation-options';
import { Translation } from './models/translation';

export class ModuleTranslateLoader implements TranslateLoader {
  private _defaultOptions: IModuleTranslationOptions = {
    enableNamespacing: true,
    nameSpaceUppercase: true,
    deepMerge: true,
    modulePathTemplate: '{baseTranslateUrl}/{moduleName}/{language}{fileType}',
    pathTemplate: '{baseTranslateUrl}/{language}{fileType}',
    ...this.options
  };

  private pathTemplateRx: RegExp = /{([^}]+)}/gi;

  /**
   * The ModuleTranslateLoader for 'ngx-translate/core'
   *
   * @description Fetch multiple translation files (http).
   *
   * @param http the HttpClient from 'angular/common'
   * @param options the configurable options for ModuleTranslateLoader
   *
   * @see https://github.com/larscom/ngx-translate-module-loader
   */
  constructor(
    private readonly http: HttpClient,
    private readonly options: IModuleTranslationOptions
  ) {}

  public getTranslation(language: string): Observable<Translation> {
    const {
      deepMerge,
      enableNamespacing,
      nameSpaceUppercase,
      modules,
      translateError,
      translateMerger,
      pathTemplate,
      modulePathTemplate,
    } = this._defaultOptions;

    const moduleRequests = modules.map(
      ({ baseTranslateUrl, moduleName, fileType, nameSpace, translateMap }) => {
        if (!moduleName) {
          const pathOptions = { baseTranslateUrl, language, fileType };
          const path = pathTemplate.replace(
            this.pathTemplateRx,
            (_, m1: string) => pathOptions[m1] || ''
          );
          return this.http.get<Translation>(path).pipe(
            map(translation => (translateMap ? translateMap(translation) : translation)),
            this._catchError(path, translateError)
          );
        }

        const modulePathOptions = { baseTranslateUrl, moduleName, language, fileType };
        const modulePath = modulePathTemplate.replace(
          this.pathTemplateRx,
          (_, m1: string) => modulePathOptions[m1] || ''
        );
        return this.http.get<Translation>(modulePath).pipe(
          map(translation => {
            if (translateMap) {
              return translateMap(translation);
            }

            if (!enableNamespacing) {
              return translation;
            }

            const key = nameSpace
              ? nameSpaceUppercase
                ? nameSpace.toUpperCase()
                : nameSpace.toLowerCase()
              : nameSpaceUppercase
              ? moduleName.toUpperCase()
              : moduleName.toLowerCase();

            return Object({ [key]: translation }) as Translation;
          }),
          this._catchError(modulePath, translateError)
        );
      }
    );

    return ForkJoin(moduleRequests).pipe(
      map(translations => {
        if (translateMerger) {
          return translateMerger(translations);
        }
        return deepMerge
          ? merge.all<Translation>(translations)
          : translations.reduce((acc, curr) => ({ ...acc, ...curr }), Object());
      })
    );
  }

  private _catchError = <T>(
    path: string,
    translateError?: (error: any, path: string) => void
  ): MonoTypeOperatorFunction<T> => {
    return catchError(e => {
      if (translateError) {
        translateError(e, path);
      }

      console.error('Unable to load translation file:', path);
      return of(Object());
    });
  };
}

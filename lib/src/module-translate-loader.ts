import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import merge from 'deepmerge';
import { forkJoin as ForkJoin, MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { IModuleTranslationOptions } from './models/module-translation-options';

export type Translation = { [x: string]: string };

export class ModuleTranslateLoader implements TranslateLoader {
  private _defaultOptions = {
    enableNamespacing: true,
    nameSpaceUppercase: true,
    deepMerge: true,
    ...this.options
  };

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
      translateError
    } = this._defaultOptions;

    const moduleRequests = modules.map(({ baseTranslateUrl, moduleName, fileType }) => {
      if (!moduleName) {
        const path = `${baseTranslateUrl}/${language}${fileType}`;
        return this.http.get<Translation>(path).pipe(this._catchError(path, translateError));
      }

      const modulePath = `${baseTranslateUrl}/${moduleName}/${language}${fileType}`;
      return this.http.get<Translation>(modulePath).pipe(
        map(translation => {
          if (!enableNamespacing) {
            return translation;
          }

          const key = nameSpaceUppercase ? moduleName.toUpperCase() : moduleName.toLowerCase();
          return Object({ [key]: translation }) as Translation;
        }),
        this._catchError(modulePath, translateError)
      );
    });

    return ForkJoin(moduleRequests).pipe(
      map(translations =>
        deepMerge
          ? merge.all<Translation>(translations)
          : translations.reduce((acc, curr) => ({ ...acc, ...curr }), Object())
      )
    );
  }

  private _catchError = <T>(
    path: string,
    translateError?: (error: any) => void
  ): MonoTypeOperatorFunction<T> => {
    return catchError(e => {
      if (translateError) {
        translateError(e);
      }

      console.error('Unable to load translation file:', path);
      return of(Object());
    });
  };
}

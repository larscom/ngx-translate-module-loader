import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import merge from 'deepmerge';
import { forkJoin as ForkJoin, MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IModuleTranslation } from './models/module-translation';
import { IModuleTranslationOptions } from './models/module-translation-options';
import { Translation } from './models/translation';

export const createJsonPath = (path: string) => path.concat('.json');

const PATH_TEMPLATE_MATCH = /{([^}]+)}/gi;

export class ModuleTranslateLoader implements TranslateLoader {
  private readonly defaultOptions: IModuleTranslationOptions = {
    enableNamespacing: true,
    nameSpaceUppercase: true,
    deepMerge: true,
    modulePathTemplate: '{baseTranslateUrl}/{moduleName}/{language}',
    pathTemplate: '{baseTranslateUrl}/{language}',
    ...this.options,
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
  constructor(private readonly http: HttpClient, private readonly options: IModuleTranslationOptions) {}

  public getTranslation(language: string): Observable<Translation> {
    const { defaultOptions: options } = this;
    return this.mergeTranslations(this.getModuleTranslations(language, options), options);
  }

  private mergeTranslations(
    moduleTranslations: Observable<Translation>[],
    { translateMerger, deepMerge }: IModuleTranslationOptions
  ): Observable<Translation> {
    return ForkJoin(moduleTranslations).pipe(
      map((translations) => {
        if (translateMerger) {
          return translateMerger(translations);
        }
        return deepMerge
          ? merge.all<Translation>(translations)
          : translations.reduce((acc, curr) => ({ ...acc, ...curr }), Object());
      })
    );
  }

  private getModuleTranslations(language: string, options: IModuleTranslationOptions): Observable<Translation>[] {
    const { modules } = options;

    return modules.map((module) => {
      const { moduleName } = module;
      return moduleName
        ? this.fetchTranslationForModule(language, options, module)
        : this.fetchTranslation(language, options, module);
    });
  }

  private fetchTranslation(
    language: string,
    { pathTemplate, translateError }: IModuleTranslationOptions,
    { baseTranslateUrl, translateMap }: IModuleTranslation
  ): Observable<Translation> {
    const pathOptions = { baseTranslateUrl, language };
    const path = createJsonPath(pathTemplate.replace(PATH_TEMPLATE_MATCH, (_, m1: string) => pathOptions[m1] || ''));

    return this.http.get<Translation>(path).pipe(
      map((translation) => (translateMap ? translateMap(translation) : translation)),
      this.catchError(path, translateError)
    );
  }

  private fetchTranslationForModule(
    language: string,
    { modulePathTemplate, enableNamespacing, nameSpaceUppercase, translateError }: IModuleTranslationOptions,
    { baseTranslateUrl, translateMap, moduleName, nameSpace }: IModuleTranslation
  ): Observable<Translation> {
    const modulePathOptions = { baseTranslateUrl, moduleName, language };
    const modulePath = createJsonPath(
      modulePathTemplate.replace(PATH_TEMPLATE_MATCH, (_, m1: string) => modulePathOptions[m1] || '')
    );
    const namespaceKey = nameSpace
      ? nameSpaceUppercase
        ? nameSpace.toUpperCase()
        : nameSpace.toLowerCase()
      : nameSpaceUppercase
      ? moduleName.toUpperCase()
      : moduleName.toLowerCase();

    return this.http.get<Translation>(modulePath).pipe(
      map((translation) => {
        return translateMap
          ? translateMap(translation)
          : enableNamespacing
          ? Object({ [namespaceKey]: translation })
          : translation;
      }),
      this.catchError(modulePath, translateError)
    );
  }

  private catchError<T>(
    path: string,
    translateError?: (error: any, path: string) => void
  ): MonoTypeOperatorFunction<T> {
    return catchError((e) => {
      if (translateError) {
        translateError(e, path);
      }

      console.error('Unable to load translation file:', path);
      return of(Object());
    });
  }
}

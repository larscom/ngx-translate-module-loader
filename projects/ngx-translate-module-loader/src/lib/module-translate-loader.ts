import { HttpClient } from '@angular/common/http'
import { TranslateLoader, TranslationObject, mergeDeep } from '@ngx-translate/core'
import { forkJoin as ForkJoin, MonoTypeOperatorFunction, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { IModuleTranslation } from './module-translation'
import { IModuleTranslationOptions } from './module-translation-options'

const appendFileExtension = (path: string, extension = 'json') => path.concat(`.${extension}`)

const PATH_TEMPLATE_REGEX = /{([^}]+)}/gi
const PATH_CLEAN_REGEX = /([^:]\/)\/+/gi
const DEFAULT_PATH_TEMPLATE = '{baseTranslateUrl}/{moduleName}/{language}'

export class ModuleTranslateLoader implements TranslateLoader {
  private readonly defaultOptions: IModuleTranslationOptions = {
    disableNamespace: false,
    lowercaseNamespace: false,
    deepMerge: true,
    ...this.options
  }

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

  public getTranslation(language: string): Observable<TranslationObject> {
    const { defaultOptions: options } = this
    return this.mergeTranslations(this.getModuleTranslations(language, options), options)
  }

  private mergeTranslations(
    moduleTranslations: Observable<TranslationObject>[],
    { deepMerge, translateMerger }: IModuleTranslationOptions
  ): Observable<TranslationObject> {
    return ForkJoin(moduleTranslations).pipe(
      map((translations) => {
        return translateMerger
          ? translateMerger(translations)
          : translations.reduce((acc, curr) => (deepMerge ? mergeDeep(acc, curr) : { ...acc, ...curr }), Object())
      })
    )
  }

  private getModuleTranslations(language: string, options: IModuleTranslationOptions): Observable<TranslationObject>[] {
    const { modules } = options

    return modules.map((module) => {
      const { moduleName } = module
      return moduleName
        ? this.fetchTranslationForModule(language, options, module)
        : this.fetchTranslation(language, options, module)
    })
  }

  private fetchTranslation(
    language: string,
    { translateError, version, headers, fileParser: fileParserRoot }: IModuleTranslationOptions,
    { pathTemplate, baseTranslateUrl, translateMap, fileParser: fileParserModule }: IModuleTranslation
  ): Observable<TranslationObject> {
    const pathOptions = Object({ baseTranslateUrl, language })
    const template = pathTemplate || DEFAULT_PATH_TEMPLATE
    const fileParser = fileParserModule ?? fileParserRoot
    const parseFn = fileParser?.parseFn ?? JSON.parse

    const cleanedPath = appendFileExtension(
      template.replace(PATH_TEMPLATE_REGEX, (_, m1: string) => pathOptions[m1] || ''),
      fileParser?.fileExtension
    ).replace(PATH_CLEAN_REGEX, '$1')

    const path = version ? `${cleanedPath}?v=${version}` : cleanedPath

    return this.http.get(path, { responseType: 'text', headers }).pipe(
      map((text) => parseFn(text)),
      map((translation) => (translateMap ? translateMap(translation) : translation)),
      this.catchError(cleanedPath, translateError)
    )
  }

  private fetchTranslationForModule(
    language: string,
    {
      disableNamespace,
      lowercaseNamespace,
      translateError,
      version,
      headers,
      fileParser: fileParserRoot
    }: IModuleTranslationOptions,
    {
      pathTemplate,
      baseTranslateUrl,
      moduleName,
      namespace,
      translateMap,
      headers: headersModule,
      fileParser: fileParserModule
    }: IModuleTranslation
  ): Observable<TranslationObject> {
    const pathOptions = Object({ baseTranslateUrl, moduleName, language })
    const template = pathTemplate || DEFAULT_PATH_TEMPLATE
    const fileParser = fileParserModule ?? fileParserRoot
    const parseFn = fileParser?.parseFn ?? JSON.parse

    const namespaceKey = namespace
      ? namespace
      : lowercaseNamespace
      ? moduleName!.toLowerCase()
      : moduleName!.toUpperCase()

    const cleanedPath = appendFileExtension(
      template.replace(PATH_TEMPLATE_REGEX, (_, m1: string) => pathOptions[m1] || ''),
      fileParser?.fileExtension
    ).replace(PATH_CLEAN_REGEX, '$1')

    const path = version ? `${cleanedPath}?v=${version}` : cleanedPath

    return this.http.get(path, { responseType: 'text', headers: headersModule || headers }).pipe(
      map((text) => parseFn(text)),
      map((translation) => {
        return translateMap
          ? translateMap(translation)
          : disableNamespace
          ? translation
          : Object({ [namespaceKey]: translation })
      }),
      this.catchError(cleanedPath, translateError)
    )
  }

  private catchError<T>(
    path: string,
    translateError?: (error: any, path: string) => void
  ): MonoTypeOperatorFunction<T> {
    return catchError((e) => {
      if (translateError) {
        translateError(e, path)
      }

      console.error('Unable to load translation file:', path)
      return of(Object())
    })
  }
}

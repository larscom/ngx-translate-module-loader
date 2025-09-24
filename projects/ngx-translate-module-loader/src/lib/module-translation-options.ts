import { HttpHeaders } from '@angular/common/http'
import { TranslationObject } from '@ngx-translate/core'
import { IModuleTranslation } from './module-translation'

export interface IModuleTranslationOptions {
  /**
   * The translation module configurations
   */
  modules: IModuleTranslation[]
  /**
   * Custom parser after retrieving a response from the server in 'text' format.
   * By using this property you can parse raw text into the required TranslationObject.
   * 
   * This parser will be used for every 'module' unless you specificy a fileParser at 'module' level.
   */
  fileParser?: {
    /**
     * This property will append the file extension to the url when fetching from the server.
     * For example: ./assets/i18n/feature1/en.json5 when you set it as json5
     */
    fileExtension: 'json5' | 'xml' | string
    /**
     * The parser function that can parse a string to a TranslationObject
     *
     * For example: for a json file you would typically use: JSON.parse()
     *
     * @param translation the raw translation file as text
     */
    parseFn: (translation: string) => TranslationObject
  }
  /**
   * By default, each module gets its own namespace so it doesn't conflict with other modules
   */
  disableNamespace?: boolean
  /**
   * By default, namespaces are uppercase
   */
  lowercaseNamespace?: boolean
  /**
   * By default, it'll perform a deepmerge when merging translation files
   */
  deepMerge?: boolean
  /**
   * Set a version to prevent the browser from caching the translation files.
   * Each translation will get a query parameter with the version number
   * @example 'en.json?v=123'
   */
  version?: string | number
  /**
   * Function that gets executed if an error occurred while retrieving a translation file
   * @param error the error that occurred
   * @param path the path to the location file
   */
  translateError?: (error: any, path: string) => void
  /**
   * Custom translate merge function after retrieving all translation files
   * @param translations the resolved translation files
   */
  translateMerger?: (translations: TranslationObject[]) => TranslationObject
  /**
   * Provide custom headers at 'root' level, which means this headers gets added to every request
   * unless you specify headers at 'module' level.
   * @see modules
   */
  headers?: HttpHeaders
}

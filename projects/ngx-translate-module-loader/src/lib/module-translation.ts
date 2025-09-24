import { HttpHeaders } from '@angular/common/http'
import { TranslationObject } from '@ngx-translate/core'

export interface IModuleTranslation {
  /**
   * The module name
   *
   * For example: shared
   * @description omit moduleName if you have a translate file at baseTranslateUrl level
   * @see baseTranslateUrl
   */
  moduleName?: string
  /**
   * The base translate URL
   *
   * For example: ./assets/i18n
   * @description the final url will then be: ./assets/i18n/shared if the moduleName is shared
   * @see moduleName
   */
  baseTranslateUrl: string
  /**
   * By default, it uses the moduleName as namespace
   * @see moduleName
   *
   * Use this property if you want to override the default namespace
   */
  namespace?: string
  /**
   * Custom translation map function after retrieving a translation file
   * @param translation the resolved translation file
   */
  translateMap?: (translation: TranslationObject) => TranslationObject
  /**
   * Custom parser after retrieving a response from the server in 'text' format.
   * By using this property you can parse raw text into the required TranslationObject.
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
   * Custom path template for fetching translations
   * @example
   * '{baseTranslateUrl}/{moduleName}/{language}'
   * or
   * @example
   * '{baseTranslateUrl}/{language}'
   *
   * It depends whether you have a moduleName defined
   * @see moduleName
   */
  pathTemplate?: string
  /**
   * Provide custom headers at 'module' level. These headers only apply to this module.
   */
  headers?: HttpHeaders
}

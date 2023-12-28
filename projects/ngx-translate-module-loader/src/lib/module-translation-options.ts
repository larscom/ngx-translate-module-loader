import { HttpHeaders } from '@angular/common/http'
import { IModuleTranslation } from './module-translation'
import { Translation } from './translation'

export interface IModuleTranslationOptions {
  /**
   * The translation module configurations
   */
  modules: IModuleTranslation[]
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
  translateMerger?: (translations: Translation[]) => Translation
  /**
   * Provide custom headers at 'root' level, which means this headers gets added to every request
   * unless you specify headers at 'module' level.
   * @see modules
   */
  headers?: HttpHeaders
}

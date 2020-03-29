import { IModuleTranslation } from './module-translation';
import { Translation } from './translation';

export interface IModuleTranslationOptions {
  /**
   * The translation module configurations
   */
  modules: IModuleTranslation[];
  /**
   * Each module gets its own namespace so it doesn't conflict with other modules
   */
  enableNamespacing?: boolean;
  /**
   * Create namespaces in Uppercase if namespacing is enabled
   */
  nameSpaceUppercase?: boolean;
  /**
   * Perform a deepmerge when merging translation files
   */
  deepMerge?: boolean;
  /**
   * Function that gets executed if an error occurred while retrieving a translation file
   * @param error the error that occurred
   * @param path the path to the location file
   */
  translateError?: (error: any, path: string) => void;
  /**
   * Custom translate merge function after retrieving all translation files
   * @param translations the resolved translation files
   */
  translateMerger?: (translations: Translation[]) => Translation;
  /**
   * Custom module path template for fetching translations
   * @example
   * '{baseTranslateUrl}/{moduleName}/{language}'
   */
  modulePathTemplate?: string;
  /**
   * Custom path template for fetching translations
   * @example
   * '{baseTranslateUrl}/{language}'
   */
  pathTemplate?: string;
}

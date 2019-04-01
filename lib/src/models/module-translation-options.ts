import { IModuleTranslation } from './module-translation';

export interface IModuleTranslationOptions {
  /**
   * The translation module configurations
   */
  modules: IModuleTranslation[];
  /**
   * Each module gets its own namespace so it doesn't conflict with other modules
   * @default enableNamespacing true
   */
  enableNamespacing?: boolean;
  /**
   * Create namespaces in Uppercase if namespacing is enabled
   * @default nameSpaceUppercase true
   */
  nameSpaceUppercase?: boolean;
  /**
   * Perform a deepmerge when merging translation files
   * @default deepMerge true
   */
  deepMerge?: boolean;
  /**
   * Function that gets executed if an http error occurred
   * @param error the error that occurred
   * @param path the path to the location file
   */
  translateError?: (error: any, path: string) => void;
}

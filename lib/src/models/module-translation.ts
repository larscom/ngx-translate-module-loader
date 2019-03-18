import { FileType } from './file-type';

export interface IModuleTranslation {
  /**
   * The module name
   *
   * For example: shared
   * @description set moduleName explicitly to null if you have a translate file at baseTranslateUrl level
   * @see baseTranslateUrl
   */
  moduleName: string;
  /**
   * The base translate URL
   *
   * For example: ./assets/i18n
   * @description the final url will then be: ./assets/i18n/shared if the moduleName is feature1
   * @see moduleName
   */
  baseTranslateUrl: string;
  /**
   * The file type of the translation file (JSON only currently)
   */
  fileType: FileType;
}

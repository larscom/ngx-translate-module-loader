import { FileType } from '../enums/file-type';
import { Translation } from '../types/translation';

export interface IModuleTranslation {
  /**
   * The module name
   *
   * For example: shared
   * @description set moduleName to null if you have a translate file at baseTranslateUrl level
   * @see baseTranslateUrl
   */
  moduleName: string;
  /**
   * The base translate URL
   *
   * For example: ./assets/i18n
   * @description the final url will then be: ./assets/i18n/shared if the moduleName is shared
   * @see moduleName
   */
  baseTranslateUrl: string;
  /**
   * The file type of the translation file (JSON only currently)
   */
  fileType: FileType;
  /**
   * By default, it uses the moduleName as nameSpace
   * @see moduleName
   *
   * Use this property if you want to override the default nameSpace
   */
  nameSpace?: string;
  /**
   * Custom translation map function after retrieving a translation file
   * @param translation the resolved translation file
   */
  translateMap?: (translation: Translation) => Translation;
}

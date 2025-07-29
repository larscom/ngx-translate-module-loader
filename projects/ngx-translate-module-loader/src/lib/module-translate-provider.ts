import { HttpClient } from '@angular/common/http'
import { InjectionToken, Provider } from '@angular/core'
import { TranslateLoader } from '@ngx-translate/core'
import { ModuleTranslateLoader } from './module-translate-loader'
import { IModuleTranslationOptions } from './module-translation-options'

export const MODULE_TRANSLATE_LOADER_CONFIG = new InjectionToken<IModuleTranslationOptions>(
  'MODULE_TRANSLATE_LOADER_CONFIG'
)

export function provideModuleTranslateLoader(options: IModuleTranslationOptions): Provider[] {
  return [
    {
      provide: MODULE_TRANSLATE_LOADER_CONFIG,
      useValue: options
    },
    {
      provide: TranslateLoader,
      useClass: ModuleTranslateLoader,
      deps: [HttpClient, MODULE_TRANSLATE_LOADER_CONFIG]
    }
  ]
}

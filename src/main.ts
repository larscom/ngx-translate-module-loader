import { provideHttpClient } from '@angular/common/http'
import { bootstrapApplication } from '@angular/platform-browser'
import { IModuleTranslationOptions, provideModuleTranslateLoader } from '@larscom/ngx-translate-module-loader'
import { provideTranslateService } from '@ngx-translate/core'
import { AppComponent } from './app/app.component'
import JSON5 from 'json5'

const baseTranslateUrl = './assets/i18n'
const options: IModuleTranslationOptions = {
  translateError: (error, path) => {
    console.log('ERROR: ', { error, path })
  },
  modules: [
    // final url: ./assets/i18n/en.json
    {
      baseTranslateUrl
    },
    // final url: ./assets/i18n/feature1/en.json
    { moduleName: 'feature1', baseTranslateUrl },
    // final url: ./assets/i18n/feature2/en.json
    { moduleName: 'feature2', baseTranslateUrl },
    // final url: ./assets/i18n/feature2/en.json5
    {
      moduleName: 'feature3',
      baseTranslateUrl,
      fileParser: {
        fileExtension: 'json5',
        parseFn: (text) => JSON5.parse(text)
      }
    }
  ]
}

bootstrapApplication(AppComponent, {
  providers: [
    provideTranslateService({
      loader: provideModuleTranslateLoader(options)
    }),
    provideHttpClient()
  ]
}).catch((err) => console.error(err))

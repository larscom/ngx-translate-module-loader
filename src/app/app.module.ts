import { HttpClient, provideHttpClient } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { IModuleTranslationOptions, ModuleTranslateLoader } from 'projects/ngx-translate-module-loader/src/public-api'
import { AppComponent } from './app.component'

export function ModuleHttpLoaderFactory(http: HttpClient) {
  const baseTranslateUrl = './assets/i18n'

  const options: IModuleTranslationOptions = {
    translateError: (error, path) => {
      console.log('ERROR: ', { error, path })
    },
    modules: [
      // final url: ./assets/i18n/en.json
      { baseTranslateUrl },
      // final url: ./assets/i18n/feature1/en.json
      { moduleName: 'feature1', baseTranslateUrl },
      // final url: ./assets/i18n/feature2/en.json
      { moduleName: 'feature2', baseTranslateUrl }
    ]
  }
  return new ModuleTranslateLoader(http, options)
}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: ModuleHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [provideHttpClient()]
})
export class AppModule {}

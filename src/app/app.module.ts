import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AppComponent } from './app.component'
import { HttpClient, HttpHeaders, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { ModuleTranslateLoader, IModuleTranslationOptions } from 'projects/ngx-translate-module-loader/src/public-api'

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
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule {}

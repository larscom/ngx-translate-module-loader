import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {
  FileType,
  ModuleTranslateLoader,
  IModuleTranslationOptions
} from '@larscom/ngx-translate-module-loader';

export function ModuleHttpLoaderFactory(http: HttpClient) {
  const fileType = FileType.JSON;
  const baseTranslateUrl = './assets/i18n';

  const options: IModuleTranslationOptions = {
    translateError: (error, path) => {
      console.log('Oeps! an error occurred: ', { error, path });
    },
    modules: [
      // final url: ./assets/i18n/en.json
      { baseTranslateUrl, fileType },
      // final url: ./assets/i18n/feature1/en.json
      { moduleName: 'feature1', baseTranslateUrl, fileType },
      // final url: ./assets/i18n/feature2/en.json
      { moduleName: 'feature2', baseTranslateUrl, fileType }
    ]
  };
  return new ModuleTranslateLoader(http, options);
}

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: ModuleHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}

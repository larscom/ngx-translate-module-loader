# @larscom/ngx-translate-module-loader

[![npm-release](https://img.shields.io/npm/v/@larscom/ngx-translate-module-loader.svg?label=npm%20release)](https://www.npmjs.com/package/@larscom/ngx-translate-module-loader)
[![git-release](https://img.shields.io/github/tag/larscom/ngx-translate-module-loader.svg?label=git%20release)](https://www.npmjs.com/package/@larscom/ngx-translate-module-loader)
[![travis build](https://img.shields.io/travis/com/larscom/ngx-translate-module-loader/master.svg?label=build%20%28master%29)](https://travis-ci.com/larscom/ngx-translate-module-loader/builds)
[![license](https://img.shields.io/npm/l/@larscom/ngx-translate-module-loader.svg)](https://github.com/larscom/ngx-translate-module-loader/blob/master/LICENSE)

A loader for [@ngx-translate/core](https://github.com/ngx-translate/core) that loads multiple translations using http.

Each translation file has it's own **namespace** out of the box so the key/value pairs do not conflict with each other.

If desired, namespacing can be disabled or modified to your own needs.


## Demo

You can play arround on StackBlitz:
https://stackblitz.com/edit/ngx-translate-module-loader

## Dependencies

`@larscom/ngx-translate-module-loader` depends on [@ngx-translate/core](https://github.com/ngx-translate/core) and [Angular](https://github.com/angular/angular).

## Installation

```bash
npm i --save @larscom/ngx-translate-module-loader
```

## Usage

**1. create an exported `HttpLoaderFactory` function**

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {
  FileType,
  ModuleTranslateLoader,
  IModuleTranslationOptions
} from '@larscom/ngx-translate-module-loader';
import { AppComponent } from './app';

export function ModuleHttpLoaderFactory(http: HttpClient) {
  const fileType = FileType.JSON;
  const baseTranslateUrl = './assets/i18n';

  const options: IModuleTranslationOptions = {
    modules: [
      // final url: ./assets/i18n/en.json
      { moduleName: null, baseTranslateUrl, fileType },
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
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Namespacing

By default, each translation file gets it's own namespace based on the `moduleName`, what does it mean?

For example with these options:

```ts
export function ModuleHttpLoaderFactory(http: HttpClient) {
  const fileType = FileType.JSON;
  const baseTranslateUrl = './assets/i18n';

  const options: IModuleTranslationOptions = {
    modules: [
      // no namespace
      { moduleName: null, baseTranslateUrl, fileType },
      // nameSpace: feature1
      { moduleName: 'feature1', baseTranslateUrl, fileType },
      // nameSpace: feature2
      { moduleName: 'feature2', baseTranslateUrl, fileType }
    ]
  };
  return new ModuleTranslateLoader(http, options);
}
```

Lets say each module in the above example resolves to the following translation:

```
{
  "KEY: "VALUE"
}
```

The final result would then be:

```
{
   "KEY: "VALUE",
   "FEATURE1" : {
     "KEY: "VALUE"
   },
    "FEATURE2" : {
     "KEY: "VALUE"
   }
}
```

If you don't need upper case keys, set `nameSpaceUppercase` to false in the options because it's upper case by default.
If you don't want to enable namespaces at all, set `enableNamespacing` to false.

You can override the default name space by setting the `nameSpace` property in the options.

## Configuration

```ts
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
}
```

```ts
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
  translationMap?: (translation: Translation) => Translation;
}
```

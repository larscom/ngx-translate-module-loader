# @larscom/ngx-translate-module-loader

[![npm-version](https://img.shields.io/npm/v/@larscom/ngx-translate-module-loader.svg?label=npm)](https://www.npmjs.com/package/@larscom/ngx-translate-module-loader)
![npm](https://img.shields.io/npm/dw/@larscom/ngx-translate-module-loader)
[![license](https://img.shields.io/npm/l/@larscom/ngx-translate-module-loader.svg)](https://github.com/larscom/ngx-translate-module-loader/blob/main/LICENSE)


> Highly configurable and flexible translations loader for [@ngx-translate/core](https://github.com/ngx-translate/core). Fetch multiple translations (http only) and configure them to your needs. Each translation file has it's own **namespace** out of the box so the key/value pairs do not conflict with each other.

### ✨ [View on StackBlitz](https://stackblitz.com/edit/ngx-translate-module-loader)

## Dependencies

`@larscom/ngx-translate-module-loader` depends on [@ngx-translate/core](https://github.com/ngx-translate/core) and [Angular](https://github.com/angular/angular).

## Installation

```bash
npm install @larscom/ngx-translate-module-loader
```

Choose the version corresponding to your Angular version

| @angular/core | @larscom/ngx-translate-module-loader |
| ------------- | ------------------------------------ |
| >= 12         | >= 3.0.0                             |
| < 12          | <= 2.2.0                             |

## Usage

Create an exported `moduleHttpLoaderFactory` function

```ts
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpClientModule, HttpClient } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { ModuleTranslateLoader, IModuleTranslationOptions } from '@larscom/ngx-translate-module-loader'
import { AppComponent } from './app'

export function moduleHttpLoaderFactory(http: HttpClient) {
  const baseTranslateUrl = './assets/i18n'

  const options: IModuleTranslationOptions = {
    modules: [
      // final url: ./assets/i18n/en.json
      { baseTranslateUrl },
      // final url: ./assets/i18n/feature1/en.json
      { baseTranslateUrl, moduleName: 'feature1' },
      // final url: ./assets/i18n/feature2/en.json
      { baseTranslateUrl, moduleName: 'feature2' }
    ]
  }

  return new ModuleTranslateLoader(http, options)
}

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: moduleHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(readonly translate: TranslateService) {
    translate.setDefaultLang('en')
  }
}
```

## Namespacing

By default, each translation file gets it's own namespace based on the `moduleName`, what does it mean?

For example with these options:

```ts
export function moduleHttpLoaderFactory(http: HttpClient) {
  const baseTranslateUrl = './assets/i18n'

  const options: IModuleTranslationOptions = {
    modules: [
      // no moduleName/namespace
      { baseTranslateUrl },
      // namespace: FEATURE1
      { baseTranslateUrl, moduleName: 'feature1' },
      // namespace: FEATURE2
      { baseTranslateUrl, moduleName: 'feature2' }
    ]
  }
  return new ModuleTranslateLoader(http, options)
}
```

Lets say each module in the **above** example resolves to the following **JSON**:

```json
{
  "KEY": "VALUE"
}
```

The final translation you are working with would be:

```json
{
  "KEY": "VALUE",
  "FEATURE1": {
    "KEY": "VALUE"
  },
  "FEATURE2": {
    "KEY": "VALUE"
  }
}
```

Even though all JSON files from those modules are the same, they don't conflict because they are not on the same level after they get merged.

## Configuration

The configuration is very flexible, you can even define custom templates for fetching translations.

```ts
interface IModuleTranslationOptions {
  /**
   * The translation module configurations
   */
  modules: IModuleTranslation[]
  /**
   * By default, each module gets its own namespace so it doesn't conflict with other modules
   */
  disableNamespace?: boolean
  /**
   * By default, namespaces are uppercase
   */
  lowercaseNamespace?: boolean
  /**
   * By default, it'll perform a deepmerge when merging translation files
   */
  deepMerge?: boolean
  /**
   * Set a version to prevent the browser from caching the translation files.
   * Each translation will get a query parameter with the version number
   * @example 'en.json?v=123'
   */
  version?: string | number
  /**
   * Function that gets executed if an error occurred while retrieving a translation file
   * @param error the error that occurred
   * @param path the path to the location file
   */
  translateError?: (error: any, path: string) => void
  /**
   * Custom translate merge function after retrieving all translation files
   * @param translations the resolved translation files
   */
  translateMerger?: (translations: Translation[]) => Translation
  /**
   * Provide custom headers at 'root' level, which means this headers gets added to every request
   * unless you specify headers at 'module' level.
   * @see modules
   */
  headers?: HttpHeaders
}
```

```ts
interface IModuleTranslation {
  /**
   * The module name
   *
   * For example: shared
   * @description omit moduleName if you have a translate file at baseTranslateUrl level
   * @see baseTranslateUrl
   */
  moduleName?: string
  /**
   * The base translate URL
   *
   * For example: ./assets/i18n
   * @description the final url will then be: ./assets/i18n/shared if the moduleName is shared
   * @see moduleName
   */
  baseTranslateUrl: string
  /**
   * By default, it uses the moduleName as namespace
   * @see moduleName
   *
   * Use this property if you want to override the default namespace
   */
  namespace?: string
  /**
   * Custom translation map function after retrieving a translation file
   * @param translation the resolved translation file
   */
  translateMap?: (translation: Translation) => Translation
  /**
   * Custom path template for fetching translations
   * @example
   * '{baseTranslateUrl}/{moduleName}/{language}'
   * or
   * @example
   * '{baseTranslateUrl}/{language}'
   *
   * It depends whether you have a moduleName defined
   * @see moduleName
   */
  pathTemplate?: string
  /**
   * Provide custom headers at 'module' level. These headers only apply to this module.
   */
  headers?: HttpHeaders
}
```

## Custom templates for fetching translations

By default, translations gets fetched by using the following template:

`'{baseTranslateUrl}/{moduleName}/{language}'` e.g. **./assets/feature1/en.json**

You can override this option if you wish to do so:

```ts
const options: IModuleTranslationOptions = {
  modules: [
    // resolves to: ./assets/my-path/en.json
    { baseTranslateUrl, pathTemplate: '{baseTranslateUrl}/my-path/{language}' },
    // resolves to: ./assets/my-path/en/feature1.json
    { baseTranslateUrl, moduleName: 'feature1', pathTemplate: '{baseTranslateUrl}/my-path/{language}/{moduleName}' },
    // resolves to: ./assets/my-path/en/feature2.json
    { baseTranslateUrl, moduleName: 'feature2', pathTemplate: '{baseTranslateUrl}/my-path/{language}/{moduleName}' }
  ]
}
```

## Custom headers

```ts
  const options: IModuleTranslationOptions = {
    // global headers, applied to every request, unless you specify headers at 'module' level
    headers: new HttpHeaders().set('Header-Name', 'Header value')
    modules: [
      { baseTranslateUrl },
      // headers only applied to this module
      { baseTranslateUrl, moduleName: 'feature1', headers: new HttpHeaders().set('Header-Name', 'Header value') },
      { baseTranslateUrl, moduleName: 'feature2' }
    ]
  };
```

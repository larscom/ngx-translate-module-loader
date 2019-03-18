import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import merge from 'deepmerge';
import { forkJoin as ForkJoin, MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { IModuleTranslationOptions } from './models/module-translation-options';

export class ModuleTranslateLoader implements TranslateLoader {
  constructor(
    private readonly _http: HttpClient,
    private readonly _options: IModuleTranslationOptions
  ) {}

  public getTranslation(language: string): Observable<any> {
    const options: IModuleTranslationOptions = {
      enableNamespacing: true,
      nameSpaceUppercase: true,
      deepMerge: true,
      ...this._options
    };

    const { deepMerge, enableNamespacing, nameSpaceUppercase, modules, translateError } = options;

    const moduleRequests = modules.map(({ baseTranslateUrl, moduleName, fileType }) => {
      if (!moduleName) {
        const path = `${baseTranslateUrl}/${language}${fileType}`;
        return this._http
          .get<{ [x: string]: string }>(path)
          .pipe(this._catchError(path, translateError));
      }

      const modulePath = `${baseTranslateUrl}/${moduleName}/${language}${fileType}`;
      return this._http.get<{ [x: string]: string }>(modulePath).pipe(
        map(translation => {
          if (!enableNamespacing) {
            return translation;
          }

          const key = nameSpaceUppercase ? moduleName.toUpperCase() : moduleName.toLowerCase();
          return { [key]: translation };
        }),
        this._catchError(modulePath, translateError)
      );
    });

    return ForkJoin(moduleRequests).pipe(
      map(translations =>
        deepMerge
          ? merge.all(translations)
          : translations.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      )
    );
  }

  private _catchError = (
    path: string,
    translateError?: (error: any) => void
  ): MonoTypeOperatorFunction<any> => {
    return catchError(e => {
      if (translateError) {
        translateError(e);
      }
      console.error('Unable to load translation file:', path);
      return of({});
    });
  };
}

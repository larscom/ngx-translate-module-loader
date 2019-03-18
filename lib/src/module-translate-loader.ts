import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import merge from 'deepmerge';
import { forkJoin as ForkJoin, MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';

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
      ...this._options
    };

    const { enableNamespacing, nameSpaceUppercase, modules, translateError } = options;

    if (modules.filter(({ moduleName }) => moduleName == null).length > 1) {
      throw Error('Only 1 module translation is allowed without a moduleName');
    }

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

    return ForkJoin(moduleRequests).pipe(map(translations => merge.all(translations)));
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

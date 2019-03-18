import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ITranslateOptions } from './models/translate-options';

export class MultiTranslateModuleLoader implements TranslateLoader {
  constructor(private readonly _http: HttpClient, private readonly _options: ITranslateOptions[]) {}

  public getTranslation(lang: string): Observable<any> {
    return this._http.get(lang);
  }
}

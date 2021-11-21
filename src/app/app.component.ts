import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <main>
      <h2>{{ 'TITLE' | translate }}</h2>
      <div>
        <label>
          {{ 'CHANGE_LANGUAGE' | translate }}
          <select #langSelect (change)="translate.use(langSelect.value)">
            <option
              *ngFor="let lang of translate.getLangs()"
              [value]="lang"
              [selected]="lang === translate.currentLang"
            >
              {{ lang }}
            </option>
          </select>
        </label>
      </div>

      <h3>{{ 'FEATURE1.TITLE' | translate }}</h3>

      <h3>{{ 'FEATURE2.TITLE' | translate }}</h3>

      <div>
        <h2>Translation ({{ translate.currentLang }})</h2>
        <pre>{{ translation$ | async | json }}</pre>
      </div>
    </main>
  `
})
export class AppComponent {
  translation$ = this.translate.onLangChange
    .asObservable()
    .pipe(switchMap(({ lang }) => this.translate.getTranslation(lang)));

  constructor(public readonly translate: TranslateService) {
    translate.addLangs(['en', 'nl']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang() || 'en';
    translate.use(browserLang.match(/en|nl/) ? browserLang : 'en');
  }
}

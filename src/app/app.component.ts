import { Component } from '@angular/core'
import { TranslateService, TranslatePipe } from '@ngx-translate/core'
import { switchMap } from 'rxjs/operators'
import { NgFor, AsyncPipe, JsonPipe } from '@angular/common'

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

      <h3>{{ 'FEATURE3.TITLE' | translate }}</h3>

      <div>
        <h2>Final Translation ({{ translate.getCurrentLang() }})</h2>
        <pre>{{ translation$ | async | json }}</pre>
      </div>
    </main>
  `,
  imports: [NgFor, AsyncPipe, JsonPipe, TranslatePipe]
})
export class AppComponent {
  translation$ = this.translate.onLangChange.pipe(switchMap(({ lang }) => this.translate.reloadLang(lang)))

  constructor(public readonly translate: TranslateService) {
    translate.addLangs(['en', 'nl'])
    translate.setFallbackLang('en')

    const browserLang = translate.getBrowserLang() || 'en'
    translate.use(browserLang.match(/en|nl/) ? browserLang : 'en')
  }
}

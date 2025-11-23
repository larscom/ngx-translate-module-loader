import { Component, inject } from '@angular/core'
import { TranslateService, TranslatePipe } from '@ngx-translate/core'
import { switchMap } from 'rxjs/operators'
import { AsyncPipe, JsonPipe } from '@angular/common'

@Component({
  selector: 'app-root',
  template: `
    <main>
      <h2>{{ 'TITLE' | translate }}</h2>
      <div>
        <label>
          {{ 'CHANGE_LANGUAGE' | translate }}
          <select #langSelect (change)="translate.use(langSelect.value)">
            @for (lang of translate.getLangs(); track lang) {
            <option [value]="lang" [selected]="lang === translate.getCurrentLang()">
              {{ lang }}
            </option>
            }
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
  imports: [AsyncPipe, JsonPipe, TranslatePipe]
})
export class AppComponent {
  translate = inject(TranslateService)
  translation$ = this.translate.onLangChange.pipe(switchMap(({ lang }) => this.translate.reloadLang(lang)))

  constructor() {
    this.translate.addLangs(['en', 'nl'])
    this.translate.setFallbackLang('en')

    const browserLang = this.translate.getBrowserLang() || 'en'
    this.translate.use(browserLang.match(/en|nl/) ? browserLang : 'en')
  }
}

import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import merge from 'deepmerge';

import { FileType } from './models/file-type';
import { IModuleTranslationOptions } from './models/module-translation-options';
import { ModuleTranslateLoader } from './module-translate-loader';

describe('ModuleTranslateLoader', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load the english translation from different modules with default configuration', done => {
    const options: IModuleTranslationOptions = {
      modules: [
        {
          moduleName: null,
          baseTranslateUrl: './assets/i18n',
          fileType: FileType.JSON
        },
        {
          moduleName: 'feature1',
          baseTranslateUrl: './assets/i18n',
          fileType: FileType.JSON
        },
        {
          moduleName: 'feature2',
          baseTranslateUrl: './assets/i18n',
          fileType: FileType.JSON
        }
      ]
    };

    const language = 'en';

    const mockTranslation = {
      key: 'value'
    };

    const loader = new ModuleTranslateLoader(TestBed.get(HttpClient), options);

    loader.getTranslation(language).subscribe(translation => {
      const modules = merge.all(
        options.modules
          .filter(({ moduleName }) => moduleName != null)
          .map(({ moduleName }) => ({ [moduleName.toUpperCase()]: mockTranslation }))
      );
      expect(translation).toEqual({ ...mockTranslation, ...modules });
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName, fileType }) => {
      const path =
        moduleName == null
          ? `${baseTranslateUrl}/${language}${fileType}`
          : `${baseTranslateUrl}/${moduleName}/${language}${fileType}`;

      const mock = httpMock.expectOne(path);
      expect(mock.request.method).toEqual('GET');
      mock.flush(mockTranslation);
    });
  });
});

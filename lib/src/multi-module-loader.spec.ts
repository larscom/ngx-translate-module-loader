import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { MultiTranslateModuleLoader } from './multi-module-loader';

describe('I18nTranslateLoader', () => {
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

  it('should load the dutch translation from different modules', done => {
    const mockTranslation = {
      key: 'value'
    };

    const loader = new MultiTranslateModuleLoader(TestBed.get(HttpClient), [{ prop: 'test' }]);

    loader.getTranslation('test').subscribe(translation => {
      expect(translation).toEqual(mockTranslation);
      done();
    });

    const defaultMock = httpMock.expectOne('test');
    expect(defaultMock.request.method).toEqual('GET');
    defaultMock.flush(mockTranslation);
  });
});

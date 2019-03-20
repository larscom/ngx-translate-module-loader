import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import merge from 'deepmerge';

import { FileType } from '../src/models/file-type';
import { IModuleTranslationOptions } from '../src/models/module-translation-options';
import { ModuleTranslateLoader } from '../src/module-translate-loader';

describe('ModuleTranslateLoader', () => {
  let httpMock: HttpTestingController;

  const defaultOptions: IModuleTranslationOptions = {
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

  const mockTranslation = {
    key: 'value',
    key1: 'value1',
    parent: {
      child: {
        grandChild: 'value1'
      }
    }
  };

  const moduleMockTranslations = {
    feature1: {
      key1: 'feature1_value1',
      key2: 'feature1_value2',
      parent: {
        child: {
          grandChild1: 'feature1_value1',
          grandChild2: 'feature1_value2'
        }
      }
    },
    feature2: {
      key3: 'feature2_value3',
      key4: 'feature2_value4',
      parent: {
        child: {
          grandChild1: 'feature2_value1',
          grandChild2: 'feature2_value2',
          grandChild3: 'feature2_value3'
        }
      }
    }
  };

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
    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.get(HttpClient), defaultOptions);

    loader.getTranslation(language).subscribe(translation => {
      const modulesTranslation = merge.all(
        defaultOptions.modules
          .filter(({ moduleName }) => moduleName != null)
          .map(({ moduleName }) => ({ [moduleName.toUpperCase()]: mockTranslation }))
      );

      const expected = { ...mockTranslation, ...modulesTranslation };

      expect(translation).toEqual(expected);
      done();
    });

    defaultOptions.modules.forEach(({ baseTranslateUrl, moduleName, fileType }) => {
      const path =
        moduleName == null
          ? `${baseTranslateUrl}/${language}${fileType}`
          : `${baseTranslateUrl}/${moduleName}/${language}${fileType}`;

      const mock = httpMock.expectOne(path);
      expect(mock.request.method).toEqual('GET');
      mock.flush(mockTranslation);
    });
  });

  it('should load the english translation from different modules with deepMerge and without namespacing', done => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      enableNamespacing: false
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.get(HttpClient), options);

    loader.getTranslation(language).subscribe(translation => {
      const expected = {
        key: 'value',
        key1: 'feature1_value1',
        key2: 'feature1_value2',
        key3: 'feature2_value3',
        key4: 'feature2_value4',
        parent: {
          child: {
            grandChild: 'value1',
            grandChild1: 'feature2_value1',
            grandChild2: 'feature2_value2',
            grandChild3: 'feature2_value3'
          }
        }
      };
      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName, fileType }) => {
      const path =
        moduleName == null
          ? `${baseTranslateUrl}/${language}${fileType}`
          : `${baseTranslateUrl}/${moduleName}/${language}${fileType}`;

      const mock = httpMock.expectOne(path);
      expect(mock.request.method).toEqual('GET');
      const response = moduleName == null ? mockTranslation : moduleMockTranslations[moduleName];
      mock.flush(response);
    });
  });

  it('should load the english translation from different modules without namespacing and deepmerge', done => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      enableNamespacing: false,
      deepMerge: false
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.get(HttpClient), options);

    loader.getTranslation(language).subscribe(translation => {
      const expected = {
        key: 'value',
        key1: 'feature1_value1',
        key2: 'feature1_value2',
        key3: 'feature2_value3',
        key4: 'feature2_value4',
        parent: {
          child: {
            grandChild1: 'feature2_value1',
            grandChild2: 'feature2_value2',
            grandChild3: 'feature2_value3'
          }
        }
      };
      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName, fileType }) => {
      const path =
        moduleName == null
          ? `${baseTranslateUrl}/${language}${fileType}`
          : `${baseTranslateUrl}/${moduleName}/${language}${fileType}`;

      const mock = httpMock.expectOne(path);
      expect(mock.request.method).toEqual('GET');
      const response = moduleName == null ? mockTranslation : moduleMockTranslations[moduleName];
      mock.flush(response);
    });
  });

  it('should execute translateError if a http error occurs and still load the other translation files', done => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      enableNamespacing: false,
      deepMerge: false,
      translateError: error => {
        expect(error).toBeInstanceOf(HttpErrorResponse);
      }
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.get(HttpClient), options);

    loader.getTranslation(language).subscribe(translation => {
      const expected = {
        key1: 'feature1_value1',
        key2: 'feature1_value2',
        key3: 'feature2_value3',
        key4: 'feature2_value4',
        parent: {
          child: {
            grandChild1: 'feature2_value1',
            grandChild2: 'feature2_value2',
            grandChild3: 'feature2_value3'
          }
        }
      };
      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName, fileType }) => {
      const path =
        moduleName == null
          ? `${baseTranslateUrl}/${language}${fileType}`
          : `${baseTranslateUrl}/${moduleName}/${language}${fileType}`;

      const mock = httpMock.expectOne(path);
      expect(mock.request.method).toEqual('GET');

      const response = moduleName == null ? mockTranslation : moduleMockTranslations[moduleName];

      mock.flush(response, {
        status: moduleName == null ? 404 : 200,
        statusText: moduleName == null ? 'not found' : 'ok'
      });
    });
  });
});

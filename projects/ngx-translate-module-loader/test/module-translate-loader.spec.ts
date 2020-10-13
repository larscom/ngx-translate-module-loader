import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { isEqual } from 'lodash';
import { IModuleTranslationOptions } from '../src/lib/models/module-translation-options';
import { Translation } from '../src/lib/models/translation';
import { toJsonPath, ModuleTranslateLoader } from '../src/lib/module-translate-loader';

const defaultOptions: IModuleTranslationOptions = {
  modules: [
    {
      baseTranslateUrl: './assets/i18n'
    },
    {
      moduleName: 'feature1',
      baseTranslateUrl: './assets/i18n'
    },
    {
      moduleName: 'feature2',
      baseTranslateUrl: './assets/i18n'
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

describe('ModuleTranslateLoader', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should give back url ending with .json', () => {
    const path = './assets/feature1/en';
    const expected = path.concat('.json');
    expect(toJsonPath(path)).toEqual(expected);
  });

  it('should load the english translation from different modules with uppercase namespace', (done) => {
    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), defaultOptions);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        FEATURE1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        FEATURE2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    defaultOptions.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null ? `${baseTranslateUrl}/${language}` : `${baseTranslateUrl}/${moduleName}/${language}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');
      mock.flush(mockTranslation);
    });
  });

  it('should load the english translation from different modules with lowercase namespace', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      lowercaseNamespace: true
    };

    const language = 'en';
    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        feature1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        feature2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    defaultOptions.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null ? `${baseTranslateUrl}/${language}` : `${baseTranslateUrl}/${moduleName}/${language}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');
      mock.flush(mockTranslation);
    });
  });

  it('should load the english translation from different modules with a custom namespace', (done) => {
    const options: IModuleTranslationOptions = {
      modules: [
        {
          moduleName: null,
          baseTranslateUrl: './assets/i18n'
        },
        {
          moduleName: 'feature1',
          namespace: 'Custom1',
          baseTranslateUrl: './assets/i18n'
        },
        {
          moduleName: 'feature2',
          namespace: 'custom2',
          baseTranslateUrl: './assets/i18n'
        }
      ]
    };

    const language = 'en';
    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        Custom1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        custom2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    defaultOptions.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null ? `${baseTranslateUrl}/${language}` : `${baseTranslateUrl}/${moduleName}/${language}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');
      mock.flush(mockTranslation);
    });
  });

  it('should load the english translation from different modules with a custom translateMerger', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      translateMerger: (translations: Translation[]) => {
        return translations.reduce((acc, curr) => ({ ...acc, ...curr }), Object());
      }
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        FEATURE1: {
          key1: 'feature1_value1',
          key2: 'feature1_value2',
          parent: {
            child: {
              grandChild1: 'feature1_value1',
              grandChild2: 'feature1_value2'
            }
          }
        },
        FEATURE2: {
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

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null ? `${baseTranslateUrl}/${language}` : `${baseTranslateUrl}/${moduleName}/${language}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');
      const response = moduleName == null ? mockTranslation : moduleMockTranslations[moduleName];
      mock.flush(response);
    });
  });

  it('should load the english translation from different modules with a custom translateMap', (done) => {
    const options: IModuleTranslationOptions = {
      deepMerge: true,
      modules: [
        {
          moduleName: null,
          baseTranslateUrl: './assets/i18n',
          translateMap: (translation: Translation) => {
            return Object.keys(translation).reduce((acc, curr) => {
              return {
                ...acc,
                [curr.toUpperCase()]: translation[curr]
              };
            }, {});
          }
        },
        {
          moduleName: 'feature1',
          baseTranslateUrl: './assets/i18n',
          translateMap: (translation: Translation) => {
            return Object.keys(translation).reduce((acc, curr) => {
              return {
                ...acc,
                [curr.toUpperCase()]: translation[curr]
              };
            }, {});
          }
        }
      ]
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        KEY: 'value',
        KEY1: 'feature1_value1',
        KEY2: 'feature1_value2',
        PARENT: {
          child: {
            grandChild: 'value1',
            grandChild1: 'feature1_value1',
            grandChild2: 'feature1_value2'
          }
        }
      };

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null ? `${baseTranslateUrl}/${language}` : `${baseTranslateUrl}/${moduleName}/${language}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');
      const response = moduleName == null ? mockTranslation : moduleMockTranslations[moduleName];
      mock.flush(response);
    });
  });

  it('should load the english translation from different modules with deepMerge and without namespace', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      disableNamespace: true
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), options);

    loader.getTranslation(language).subscribe((translation) => {
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

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null ? `${baseTranslateUrl}/${language}` : `${baseTranslateUrl}/${moduleName}/${language}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');
      const response = moduleName == null ? mockTranslation : moduleMockTranslations[moduleName];
      mock.flush(response);
    });
  });

  it('should load the english translation from different modules without namespace and deepmerge', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      disableNamespace: true,
      deepMerge: false
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), options);

    loader.getTranslation(language).subscribe((translation) => {
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

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null ? `${baseTranslateUrl}/${language}` : `${baseTranslateUrl}/${moduleName}/${language}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');
      const response = moduleName == null ? mockTranslation : moduleMockTranslations[moduleName];
      mock.flush(response);
    });
  });

  it('should execute translateError if a http error occurs and still load the other translation files', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      disableNamespace: true,
      deepMerge: false,
      translateError: (error, path) => {
        expect(path).toEqual('./assets/i18n/en.json');
        expect(error instanceof HttpErrorResponse).toBeTruthy();
      }
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), options);

    loader.getTranslation(language).subscribe((translation) => {
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

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null ? `${baseTranslateUrl}/${language}` : `${baseTranslateUrl}/${moduleName}/${language}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');

      const response = moduleName == null ? mockTranslation : moduleMockTranslations[moduleName];

      mock.flush(response, {
        status: moduleName == null ? 404 : 200,
        statusText: moduleName == null ? 'not found' : 'ok'
      });
    });
  });

  it('should load from custom path templates', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      pathTemplate: '{baseTranslateUrl}/{language}',
      modulePathTemplate: '{baseTranslateUrl}/{language}/{moduleName}'
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        FEATURE1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        FEATURE2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null ? `${baseTranslateUrl}/${language}` : `${baseTranslateUrl}/${language}/${moduleName}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');

      mock.flush(mockTranslation);
    });
  });

  it('should load from custom path templates 2', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      pathTemplate: '{baseTranslateUrl}/test-path/{language}',
      modulePathTemplate: '{baseTranslateUrl}/test-path/{language}/{moduleName}'
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(TestBed.inject(HttpClient), options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        FEATURE1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        FEATURE2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(isEqual(translation, expected)).toBeTruthy();
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path =
        moduleName == null
          ? `${baseTranslateUrl}/test-path/${language}`
          : `${baseTranslateUrl}/test-path/${language}/${moduleName}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');

      mock.flush(mockTranslation);
    });
  });

  function createTestRequest(path: string): TestRequest {
    return httpMock.expectOne(toJsonPath(path));
  }
});

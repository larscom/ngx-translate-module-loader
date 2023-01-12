import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { Translation } from 'projects/ngx-translate-module-loader/src/public-api';
import { ModuleTranslateLoader } from './module-translate-loader';
import { IModuleTranslationOptions } from './module-translation-options';
import { TranslationKey } from './translation';

const translation: Translation = {
  key: 'value',
  key1: 'value1',
  parent: {
    child: {
      grandChild: 'value1'
    }
  }
};

const completeTranslation: Translation = {
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

describe('ModuleTranslateLoader', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [BrowserTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load the english translation from different modules with uppercase namespace', (done) => {
    const language = 'en';

    const loader = new ModuleTranslateLoader(httpClient, defaultOptions);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        FEATURE1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        FEATURE2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(translation).toEqual(expected);
      done();
    });

    defaultOptions.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const mock = createTestRequest(getTranslatePath(baseTranslateUrl, moduleName!, language));
      expect(mock.request.method).toEqual('GET');
      mock.flush(translation);
    });
  });

  it('should load the english translation from different modules with lowercase namespace', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      lowercaseNamespace: true
    };

    const language = 'en';
    const loader = new ModuleTranslateLoader(httpClient, options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        feature1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        feature2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(translation).toEqual(expected);
      done();
    });

    defaultOptions.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const mock = createTestRequest(getTranslatePath(baseTranslateUrl, moduleName!, language));
      expect(mock.request.method).toEqual('GET');
      mock.flush(translation);
    });
  });

  it('should load the english translation from different modules with a custom namespace', (done) => {
    const options: IModuleTranslationOptions = {
      modules: [
        {
          moduleName: undefined,
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
    const loader = new ModuleTranslateLoader(httpClient, options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        Custom1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        custom2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(translation).toEqual(expected);
      done();
    });

    defaultOptions.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const mock = createTestRequest(getTranslatePath(baseTranslateUrl, moduleName!, language));
      expect(mock.request.method).toEqual('GET');
      mock.flush(translation);
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

    const loader = new ModuleTranslateLoader(httpClient, options);

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

      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const mock = createTestRequest(getTranslatePath(baseTranslateUrl, moduleName!, language));
      expect(mock.request.method).toEqual('GET');
      const response = moduleName ? completeTranslation[moduleName as keyof Object] : translation;
      mock.flush(response);
    });
  });
  it('should load the english translation from different modules with a custom translateMap', (done) => {
    const options: IModuleTranslationOptions = {
      deepMerge: true,
      modules: [
        {
          moduleName: undefined,
          baseTranslateUrl: './assets/i18n',
          translateMap: (translation: Translation) => {
            return Object.keys(translation)
              .map((key) => key as TranslationKey)
              .reduce((acc, curr) => {
                return {
                  ...acc,
                  [curr.toUpperCase()]: translation[curr]
                };
              }, Object());
          }
        },
        {
          moduleName: 'feature1',
          baseTranslateUrl: './assets/i18n',
          translateMap: (translation: Translation) => {
            return Object.keys(translation)
              .map((key) => key as TranslationKey)
              .reduce((acc, curr) => {
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

    const loader = new ModuleTranslateLoader(httpClient, options);

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

      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const mock = createTestRequest(getTranslatePath(baseTranslateUrl, moduleName!, language));
      expect(mock.request.method).toEqual('GET');
      const response = moduleName ? completeTranslation[moduleName as keyof Object] : translation;
      mock.flush(response);
    });
  });

  it('should load the english translation from different modules with deepMerge and without namespace', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      disableNamespace: true
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(httpClient, options);

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

      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const mock = createTestRequest(getTranslatePath(baseTranslateUrl, moduleName!, language));
      expect(mock.request.method).toEqual('GET');
      const response = moduleName ? completeTranslation[moduleName as keyof Object] : translation;
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

    const loader = new ModuleTranslateLoader(httpClient, options);

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

      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const mock = createTestRequest(getTranslatePath(baseTranslateUrl, moduleName!, language));
      expect(mock.request.method).toEqual('GET');
      const response = moduleName ? completeTranslation[moduleName as keyof Object] : translation;
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

    const loader = new ModuleTranslateLoader(httpClient, options);

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

      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const mock = createTestRequest(getTranslatePath(baseTranslateUrl, moduleName!, language));
      expect(mock.request.method).toEqual('GET');

      const response = moduleName ? completeTranslation[moduleName as keyof Object] : translation;

      mock.flush(response, {
        status: moduleName == null ? 404 : 200,
        statusText: moduleName == null ? 'not found' : 'ok'
      });
    });
  });

  it('should load from custom path templates', (done) => {
    const options: IModuleTranslationOptions = {
      modules: [
        {
          baseTranslateUrl: './assets/i18n',
          pathTemplate: '{baseTranslateUrl}/{language}'
        },
        {
          moduleName: 'feature1',
          baseTranslateUrl: './assets/i18n',
          pathTemplate: '{baseTranslateUrl}/{language}/{moduleName}'
        },
        {
          moduleName: 'feature2',
          baseTranslateUrl: './assets/i18n',
          pathTemplate: '{baseTranslateUrl}/{language}/{moduleName}'
        }
      ]
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(httpClient, options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        FEATURE1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        FEATURE2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path = moduleName ? `${baseTranslateUrl}/${language}/${moduleName}` : `${baseTranslateUrl}/${language}`;
      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');

      mock.flush(translation);
    });
  });

  it('should load from multiple different custom path templates', (done) => {
    const options: IModuleTranslationOptions = {
      modules: [
        {
          baseTranslateUrl: './assets/i18n',
          pathTemplate: '{baseTranslateUrl}/test-path/{language}'
        },
        {
          moduleName: 'feature1',
          baseTranslateUrl: './assets/i18n',
          pathTemplate: '{baseTranslateUrl}/test-path/{language}/{moduleName}'
        },
        {
          moduleName: 'feature2',
          baseTranslateUrl: './assets/i18n',
          pathTemplate: '{baseTranslateUrl}/test-path/{language}/{moduleName}'
        },
        {
          moduleName: 'feature3',
          baseTranslateUrl: './assets/i18n',
          pathTemplate: '{baseTranslateUrl}/test-path/{language}/extra/{moduleName}'
        }
      ]
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(httpClient, options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        FEATURE1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        FEATURE2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        FEATURE3: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(translation).toEqual(expected);
      done();
    });

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path = moduleName
        ? moduleName === 'feature3'
          ? `${baseTranslateUrl}/test-path/${language}/extra/${moduleName}`
          : `${baseTranslateUrl}/test-path/${language}/${moduleName}`
        : `${baseTranslateUrl}/test-path/${language}`;

      const mock = createTestRequest(path);
      expect(mock.request.method).toEqual('GET');

      mock.flush(translation);
    });
  });

  it('should have query param with version in each module', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      version: 123
    };

    const language = 'en';

    const loader = new ModuleTranslateLoader(httpClient, options);

    loader.getTranslation(language).subscribe((translation) => {
      const expected = {
        key: 'value',
        key1: 'value1',
        parent: { child: { grandChild: 'value1' } },
        FEATURE1: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } },
        FEATURE2: { key: 'value', key1: 'value1', parent: { child: { grandChild: 'value1' } } }
      };

      expect(translation).toEqual(expected);
      done();
    });

    defaultOptions.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const path = getTranslatePath(baseTranslateUrl, moduleName!, language);
      const mock = httpMock.expectOne(`${path.concat('.json')}?v=${options.version}`);

      expect(mock.request.method).toEqual('GET');

      mock.flush(translation);
    });
  });

  it('should add headers to the request in each module', (done) => {
    const options: IModuleTranslationOptions = {
      ...defaultOptions,
      headers: new HttpHeaders().set('Header-Name', 'value')
    };

    const language = 'en';
    const loader = new ModuleTranslateLoader(httpClient, options);

    loader.getTranslation(language).subscribe(() => done());

    options.modules.forEach(({ baseTranslateUrl, moduleName }) => {
      const mock = createTestRequest(getTranslatePath(baseTranslateUrl, moduleName!, language));

      expect(mock.request.method).toEqual('GET');
      expect(mock.request.headers.has('Header-Name')).toBeTrue();

      mock.flush(translation);
    });
  });

  it('should add global headers to modules request only if there are no module headers defined', (done) => {
    const options: IModuleTranslationOptions = {
      headers: new HttpHeaders().set('Global-Header', 'value'),
      modules: [
        {
          moduleName: 'feature1',
          baseTranslateUrl: './assets/i18n',
          headers: new HttpHeaders().set('Module-Header', 'value')
        },
        {
          moduleName: 'feature2',
          baseTranslateUrl: './assets/i18n'
        }
      ]
    };

    const language = 'en';
    const loader = new ModuleTranslateLoader(httpClient, options);

    loader.getTranslation(language).subscribe(() => done());

    let mock = createTestRequest(getTranslatePath(options.modules[0].baseTranslateUrl, options.modules[0].moduleName!, language));
    expect(mock.request.method).toEqual('GET');
    expect(mock.request.headers.has('Module-Header')).toBeTrue();
    mock.flush(translation);

    mock = createTestRequest(getTranslatePath(options.modules[1].baseTranslateUrl, options.modules[1].moduleName!, language));
    expect(mock.request.method).toEqual('GET');
    expect(mock.request.headers.has('Global-Header')).toBeTrue();
    mock.flush(translation);
  });

  function createTestRequest(path: string): TestRequest {
    return httpMock.expectOne(path.concat('.json'));
  }

  function getTranslatePath(baseTranslateUrl: string, moduleName: string, language: string): string {
    return moduleName ? `${baseTranslateUrl}/${moduleName}/${language}` : `${baseTranslateUrl}/${language}`;
  }
});

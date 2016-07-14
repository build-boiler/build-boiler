// Libraries
import merge from 'lodash/merge';
import {expect} from 'chai';
import sinon from 'sinon';
// Mocks
import makeMockConfig from '../../../../test/config/make-mock-config';
// Helpers
import getPageDataFn from '../../src/pre-render/page-data';


describe(`#getPageDataFn`, () => {
  const config = makeMockConfig();
  const mockFile = {
    path: '/Users/bleep/bloop/src/templates/pages/index',
    key: 'pages/index',
    data: {}
  };

  it(`should merge data from all local files if no glob is specified`, () => {
    const middlewareConfig = {
      config,
      app: { cache: { data: {} } }
    };
    const pageDataFn = getPageDataFn(middlewareConfig);

    pageDataFn(mockFile, (error, file) => {
      expect(file).to.deep.equals(merge({}, mockFile, {
        data: {
          page_data: {
            some_local_stuff: 'Stuff from src/templates/pages/local.yml',
            es_key: 'español',
            en_key: 'english'
          }
        }
      }));
    });
  });

  it(`should merge data from specified local files if a glob is provided`, () => {
    const middlewareConfig = {
      config,
      app: { cache: { data: {} } },
      glob: '**/!(es-)*.yml'
    };
    const pageDataFn = getPageDataFn(middlewareConfig);
    pageDataFn(mockFile, (error, file) => {
      expect(file).to.deep.equals(merge({}, mockFile, {
        data: {
          page_data: {
            some_local_stuff: 'Stuff from src/templates/pages/local.yml',
            en_key: 'english'
          }
        }
      }));
    });
  });
});

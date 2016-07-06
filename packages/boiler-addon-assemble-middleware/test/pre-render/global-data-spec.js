// Libraries
import {expect} from 'chai';
import sinon from 'sinon';
// Mocks
import makeMockConfig from '../../../../test/config/make-mock-config';
// Helpers
import getGlobalDataFn from '../../src/pre-render/global-data';


describe(`#getGlobalDataFn`, () => {
  const config = makeMockConfig();

  it(`should merge data from all files if no glob is specified`, () => {
    const mockFile = { data: {} };
    const middlewareConfig = {
      config,
      app: { cache: { data: {} } }
    };
    const globalDataFn = getGlobalDataFn(middlewareConfig);
    globalDataFn(mockFile, (error, file) => {
      expect(file).to.deep.equals({
        data: {
          global_data: {
            some_global_stuff: 'bloop',
            es_key: 'español',
            en_key: 'english'
          }
        }
      });
    });
  });

  it(`should merge data from specified files if a glob is provided`, () => {
    const mockFile = { data: {} };
    const middlewareConfig = {
      config,
      app: { cache: { data: {} } },
      glob: '**/!(es-)*.yml'
    };
    const globalDataFn = getGlobalDataFn(middlewareConfig);
    globalDataFn(mockFile, (error, file) => {
      expect(file).to.deep.equals({
        data: {
          global_data: {
            some_global_stuff: 'bloop',
            en_key: 'english'
          }
        }
      });
    });
  });
});

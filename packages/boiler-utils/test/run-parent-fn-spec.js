import {expect} from 'chai';
import sinon from 'sinon';
import {noop as mockStream} from 'gulp-util';
import runParent from '../src/run-parent-fn';

describe('#runParentFn()', () => {
  const gulpMock = {};
  const configMock = {};
  const pluginsMock = {};
  const data = {
    bleep: 'bloop'
  };
  const src = ['/bleep.js'];

  it('should run the parent function and return the original data', () => {
    const spy = sinon.spy();
    const opts = {
      fn() {
        spy.apply(sinon, arguments);
      }
    };
    const taskData = {src, data};
    const ret = runParent([ gulpMock, pluginsMock, configMock, opts ], taskData);
    const [first, second, third, fourth] = spy.getCall(0).args;

    expect(first).to.eql(gulpMock);
    expect(second).to.eql(pluginsMock);
    expect(third).to.eql(configMock);
    expect(fourth).to.eql(taskData);
    expect(ret).to.eql(taskData);
  });

  describe('modifying the `src` attribute', () => {
    it('should return a custom source as an array', () => {
      const taskData = {src, data};
      const newSrc = '/bloop.js';
      const opts = {
        fn(gulp, plugins, config, {src, data}) {
          src.push(newSrc)

          return { src, data };
        }
      };
      const ret = runParent([ gulpMock, pluginsMock, configMock, opts ], taskData);

      expect(ret.data).to.eql(taskData.data);
      expect(ret.src).to.include.members([
        ...src,
        newSrc
      ]);
    });

    it('should return a custom source as a string', () => {
      const taskData = {src, data};
      const newSrc = '/bloop.js';
      const opts = {
        fn(gulp, plugins, config, {src, data}) {
          src = newSrc;

          return { src, data };
        }
      };
      const ret = runParent([ gulpMock, pluginsMock, configMock, opts ], taskData);

      expect(ret.data).to.eql(taskData.data);
      expect(ret.src).to.equal(newSrc);
    });

    it('should return the original source if the new source is not a String or Array', () => {
      const taskData = {src, data};
      const opts = {
        fn(gulp, plugins, config, {src, data}) {
          return { src: 2, data };
        }
      };
      const ret = runParent([ gulpMock, pluginsMock, configMock, opts ], taskData);

      expect(ret.data).to.eql(taskData.data);
      expect(ret.src).to.eql(src);
    });
  });

  describe('modifying the `data` attribute', () => {
    it('should return customized data if it is an Object', () => {
      const taskData = {src, data};
      const newData = {bloosh: 'bloosh'};
      const opts = {
        fn(gulp, plugins, config, {src, data}) {

          return { src, data: Object.assign({}, data, newData) };
        }
      };
      const ret = runParent([ gulpMock, pluginsMock, configMock, opts ], taskData);

      expect(ret.src).to.eql(taskData.src);
      expect(ret.data).to.eql(
        Object.assign({}, data, newData)
      );
    });

    it('should return the original data if the customized data is `undefined`', () => {
      const taskData = {src, data};
      const newData = {bloosh: 'bloosh'};
      const opts = {
        fn(gulp, plugins, config, {src, data}) {

          return { src, data: undefined };
        }
      };
      const ret = runParent([ gulpMock, pluginsMock, configMock, opts ], taskData);

      expect(ret.src).to.eql(taskData.src);
      expect(ret.data).to.eql(data);
    });
  });

  describe('overriding the task', () => {
    it('should work with a function', () => {
      const taskData = {src, data};
      const noop = () => {};
      const opts = {
        fn(gulp, plugins, config, {src, data}) {

          return noop;
        }
      };
      const ret = runParent([ gulpMock, pluginsMock, configMock, opts ], taskData);

      expect(ret).to.eql({fn: noop});
    });

    it('should work with a Stream', () => {
      const taskData = {src, data};
      const throughObj = mockStream();
      const opts = {
        fn(gulp, plugins, config, {src, data}) {

          return throughObj;
        }
      };
      const ret = runParent([ gulpMock, pluginsMock, configMock, opts ], taskData);

      expect(ret).to.eql({fn: throughObj});
    });
  });
});




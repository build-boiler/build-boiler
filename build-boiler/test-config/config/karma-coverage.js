import './karma-index';

/**
 * recursively require all source for isparta code coverage
 * ignore index.js because React component will try to mount before
 * DOM is available
 */
const projectContext = require.context('../../src/js', true, /(config|services|modules|component-utils|module-utils|flux-bootstrap)/);
projectContext.keys().forEach(projectContext);

/**
 * Remove this if you are making a project and not a module
 */
/**
 * If it's a module then require all the module code
 */
const moduleContext = require.context('../../lib', true, /(components|modules|component-utils|module-utils)/);
moduleContext.keys().forEach(moduleContext);

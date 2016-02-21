import './karma-index';

/**
 * recursively require all source for isparta code coverage
 * ignore index.js because React component will try to mount before
 * DOM is available
 */
const projectContext = require.context('../../src/js', true, /(config|services|modules|component-utils|module-utils|flux-bootstrap)/);
projectContext.keys().forEach(projectContext);

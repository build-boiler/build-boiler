import '../src/scss/main.scss';

const img = require.context('../src/img', true, /\.(jpeg|jpg|png|gif|svg)$/);

img.keys().forEach(img);

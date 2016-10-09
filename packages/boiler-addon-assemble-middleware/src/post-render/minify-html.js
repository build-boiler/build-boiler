import {minify as minifyHtml} from 'html-minifier';

const minifyOptions = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
};

export default function minHtml(middlewareConfig) {
  const {config} = middlewareConfig;
  const {environment, assemble} = config;
  const {isDev} = environment;
  const {minify = false} = assemble;

  return (file, next) => {
    file.content = !isDev && minify
      ? minifyHtml(file.content, minifyOptions)
      : file.content;
    next();
  };
}

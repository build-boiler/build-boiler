import nunjucks from 'nunjucks';
import customTags from './custom-tags';

export default function(app) {
  const instance = nunjucks.configure({
    watch: false,
    noCache: true
  });

  Object.keys(customTags).forEach((tag) => {
    instance.addExtension(tag, new customTags[tag](app));
  });

  return instance;
}

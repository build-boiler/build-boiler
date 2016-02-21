## Build Boilerplate
*NOTE*: If you are looking to use the `build-boiler` NPM module to simplify your hipster 2016 builds, please `npm i build-boiler@latest` https://www.npmjs.com/package/build-boiler and then mimic the direcory structure and dependencies of this repo in the project where `buld-boiler` is installed.

![](http://i.imgur.com/hsQwU0a.gif)

#### Steps to Install & Run
- Install [NVM](https://github.com/creationix/nvm) to manage/install NodeJS
- `nvm install 5` to install Node 5
- `npm i -g npm@3` to update your NPM
- `npm i -g gulp` to install Gulp task runner globally
- `npm i`
- `gulp watch`

#### How, What, Why
The `build-boilerplate-repo` skeleton (ie. everything in the top level of this repo, excluding the `build-boiler` directory) is a small application for testing local development of the [build-boiler](https://github.com/dtothefp/build-boiler/tree/master/build-boiler) module. The [build-boiler NPM module](https://www.npmjs.com/package/build-boiler) is constructed in this repo's `build-boiler` directory, compiled from `src` to `dist` in that directory, and deployed through Travis. This module is meant to power small to large projects that desire generation of static HTML, the usage of es6/7 for client and build code, SCSS comilation, and Image compression. The primary tasks are `gulp watch` to develop locally with livereload & sourcemaps, and `gulp build` to build your app for production with uglification of JS, minification of CSS, and hashing of JS/CSS filepaths.  *IMPORTANT*: Therefore, to use the `build-boiler` NPM module modulehttps://www.npmjs.com/package/build-boiler, create a directory structure that mirrors this repo, omitting the `build-boiler` diretory. Overcomplicated and confusing for sure, but I promise will be worth your while (enter :neckbeard emoji here).

Customization of the build is generally not necessary, but [config passed](https://github.com/HillaryClinton/microsite-boilerplate/blob/master/gulp/config/index.js) to [build-boiler](https://github.com/dtothefp/build-boiler) is encouraged to add functionality to your project. If additonal build tasks are desired or customiztion of build aspects in necessary it is possible to hook into the build process by adding files to [gulp/tasks] (https://github.com/HillaryClinton/microsite-boilerplate/tree/master/gulp/tasks).

#### Getting Started
Build your JS, SCSS, and HTML from `src` to `dist` with the following commands
- `gulp watch` => File changes will re-compile automatically and livereload with BrowserSync.
- `gulp build` => Images will be optimized, JS will be uglified/deduped, CSS will be minified, and JS/CSS bundles with get hashed file paths. If you would like to preview your "prod like" build, subsequently run `gulp browser-sync` open and view in your browser.

#### HTML/Nunjucks Templates
[Assemble](https://github.com/assemble/assemble-core) and [Nunjucks](https://mozilla.github.io/nunjucks/) are used to build the HTML although knowledge of either of them is mostly unnecessary to develop an application with `microsite-boilerplate`. The only Nunjucks syntax that is required is the `{% get_assets name="<js or css>" %}` tag which you can view in the [default layout](https://github.com/HillaryClinton/microsite-boilerplate/blob/master/src/templates/layouts/default.html#L19). This tag is a requirement because in the "prod like" build it manages proper references of hashed files. General features and instructions for building templates are as follows:
- Using Nunjucks layouts:
  - Add any markup that you would like to use univerally throughout your HTML in a [layout file](https://github.com/HillaryClinton/microsite-boilerplate/tree/master/src/templates/layouts)
  - extend this layout inside your [page](https://github.com/HillaryClinton/microsite-boilerplate/tree/master/src/templates/pages) by using the `{% extend layouts('<your_layout_name_withou_html') %}`
  - Write any html in your [page](https://github.com/HillaryClinton/microsite-boilerplate/blob/master/src/templates/pages/index.html) and add it to your layout using the `{% block <block_name> %}` Nunjucks syntax
- Omit using a Layout and write HTML in [pages](https://github.com/HillaryClinton/microsite-boilerplate/tree/master/src/templates/pages)
  - Just write straight up HTML in your `.html` file hardcoding the `<html>`, `<head>`, and `<body>` tags, and remember to include the `{% get_assets %}` tags for your JS and CSS.

Some common functionality and data is shared within Assemble/Nunjucks templates.
- Gloabl Data YAML from [src/config](https://github.com/HillaryClinton/microsite-boilerplate/tree/master/src/config) can be accessed in every template using `{{global_data.some_key}}`
- Local Page Data YAML from `.yml` in the [src/templates/pages/<some_page_dir>](https://github.com/HillaryClinton/microsite-boilerplate/blob/master/src/templates/pages/local.yml)can be accessed in the template that shares the directory using `{{page_data.some_key}}`
- [YAML-Front-Matter](https://www.npmjs.com/package/parser-front-matter) can be used in any page
- `{% debug %}` see the template context for each page => will be logged to your terminal
- `{% debug key="some.key" %}` see the template context for `{some: {key: /*data*/ }}` in the template context
- `{% get_assets name="css" %}` yields a `<link>` tag with the compiled `main.scss`
- `{% get_assets name="js" %}` yields a `<script>` tag with the compiled `index.js`

#### JavaScript Compilation
The only JavaScript entry is [src/js/index.js](https://github.com/HillaryClinton/microsite-boilerplate/blob/master/src/js/index.js) although it is encouraged to modularize your JavaScript by `import`/`require`ing it from other files withing the `js` directory. JS is compiled through Webpack and full es6/7 support along with React support is provided by Babel. JavaScript is linted lightly through the [build-boiler](https://github.com/dtothefp/build-boiler) and configurations for both Webpack and Linting may be customized through the [build-boiler](https://github.com/dtothefp/build-boiler) hooks.  Source Maps are supported and will map any debugging such as `debugger` and `console.log` (only allowed by eslint in `gulp watch`) back to the original es6/7 file. If using `require` rather than `import` all default exported modules `module.exports` or `export default` will be accessed off of a `default` property on the `require`d module.

#### SCSS Compilation
The SCSS entry is [src/scss/main.scss](https://github.com/HillaryClinton/microsite-boilerplate/blob/master/src/scss/main.scss) and SCSS is compiled with source maps through Webpack. It is encouraged to write your SCSS modularly and to `@import` it from sepearate files in the SCSS directory into `main.scss`. If using external frameworks and `includePaths` array can be passed to the Webpack `sass-loader` by adding it to [gulp/config/index.js](https://github.com/HillaryClinton/microsite-boilerplate/blob/master/gulp/config/index.js).

#### Images
Images are copied from `src` to `dist` from the [src/img](https://github.com/HillaryClinton/microsite-boilerplate/tree/master/src/img) directory. Any images in this directory can be referenced in CSS or HTML. Some utilities are provided in Nunjucks to access these images or they may be referenced by a relative path. Images are processed through Webpack and are optimized when running the "prod like" build with `gulp build`
- Using Nunjucks => `<img src="{{assets.images['my-image-name.jpg']}}" />`
- Old school => `<img src="/img/my-image-name.jpg" />`

#### File Structure of Parent Using build-boiler
```
├── .babelrc # only effects build config compiled through `babel-register`
├── .nvmrc # constrains to Node 5.6.0
├── gulp # relays added tasks/config to `build-boiler` module
│   ├── config
│   │   └── index.js # main config available in `gulp/tasks`
│   └── tasks
│       ├── eslint.js # example of how to extend/overwrite `eslint` task from `build-boiler`
│       └── sample.js # example of how to include a `gulp` task that is not in `build-boiler`
├── gulpfile.babel.js # all tasks exposed by `build-boiler` must be registered and run here
├── package.json
└── src
    ├── config
    │   └── global.yml # `global_data` exposed to all `.html` in `templates/pages`
    ├── img
    │   └── kitten.jpg # any images here may be referenced in scss and html
    ├── js
    │   ├── index.js # main entry point for JavaScript => `import`/`require` to include more files => compiles to `main.js`
    │   └── shims.js # `import`/`require` any shims to be included, `babel-polyfill` is automatically included by `build-boiler`
    ├── scss
    │   └── main.scss # main scss entry point => `@import` more scss into this file => compiles to `global.css`
    └── templates
        ├── layouts
        │   └── default.html # Nunjucks layout that can be referenced in `pages` using `{% extend layouts('default') %}`
        └── pages # add additonal directories inside here to create paths => page/page-dir/index.html => localhost:8000/page-dir
            ├── index.html # Nunjucks to be injected using `{% block %}` tags or alternatively just write all your html in here and omit the layout
            └── local.yml # `page_data` available only in page that shares the directory
```

#### Module Installation and Tasks
- `npm i`
  - installs all Node/NPM dependencies
- `rm -rf node_modules && npm cache clean && npm i` =>
  - if you would ever like to clear your Node/NPM cache and start from scratch
- `npm i -S <some_package_name>`
  - install a new dependency and save it in your package.json `dependencies`
- `npm i -D <some_package_name>`
  - install a new dependency and save it in your package.json `devDependencies`
- `npm i <some_package_name>@latest`
  - install the latest version of a node module
- `"some-package-name": "git+ssh://git@github.com:dtothefp/<some-repo-name>.git#<some-branch-name>"`
  - install a package directly from githuh, in this case we also specify a branch (*note*: this is useful for testing NPM packages without publishing them, but this will break on a Travis build if it is from a private repo.)
- `gulp watch`
  - run the local build with live/hot reload
- `gulp build -q && gulp browser-sync`
  - run the Isomorphic build in a closer to "prod" mode (ie no live/hot reload) without uglification and minification and start the BrowserSync server when finished
- `gulp build && gulp browser-sync`
  - run the Isomorphic build and preview locally on BrowserSync

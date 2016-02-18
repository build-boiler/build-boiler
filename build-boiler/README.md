### Build Boilerplate

![](http://i.imgur.com/hsQwU0a.gif)

# Steps to Install & Run
- Install [NVM](https://github.com/creationix/nvm) to manage/install NodeJS
- `nvm install 5` to install Node 5
- `npm i -g npm@3` to update your NPM
- `npm i -g gulp` to install Gulp task runner globally
- `npm i`
- `gulp watch`


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
  - install the latest version of a node module, in this case it is a node module on our @HFA private NPM
- `"some-package-name": "git+ssh://git@github.com:HillaryClinton/<some-repo-name>.git#<some-branch-name>"`
  - install a package directly from githuh, in this case we also specify a branch (*note*: this is useful for testing NPM packages without publishing them, but this will break on a Travis build if it is from a private repo.)
- `gulp watch`
  - run the local build with live/hot reload
- `gulp build -q && gulp browser-sync`
  - run the Isomorphic build in a closer to "prod" mode (ie no live/hot reload) without uglification and minification and start the BrowserSync server when finished
- `gulp build && gulp browser-sync`
  - run the Isomorphic build and preview locally on BrowserSync

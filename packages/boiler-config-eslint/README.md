# eslint-config
Configuration for JavaScript code linting.

#### Gulp
- must be used with `gulp-eslint@2`
```js
import eslintConfig from 'eslint-config';
import formatter from 'eslint-friendly-formatter';

gulp.task('lint', () => {
  const lintConfig = eslintConfig({
    isDev: true,
    lintEnv: 'build'
  });

  return gulp.src(src)
    .pipe(eslint(lintConfig))
    .pipe(eslint.format(formatter));
});
```

#### Webpack

```js
import eslintConfig from 'eslint-config';

const {rules, configFile} = eslintConfig({/*options*/});

export default {
  entry: //
  output: //
  eslint: {
    rules,
    configFile,
    formatter,
    emitError: false,
    emitWarning: false,
    failOnWarning: !isDev,
    failOnError: !isDev
  }
}
```

## API

### eslint(options)

#### options.isDev

Type: `Boolean`

Allows `debugger` and `console` as well as being lighter on other rules

#### options.basic

Type: `Boolean`

Only applies a small subset of rules

#### options.lintEnv

Type: `String` 'build', 'web', 'test'

Changes rules per env

#### options.react

Type: `Boolean`

Add rules for React/JSX

#### options.generate

Type: `Boolean`

Generate a `.eslintrc` in your project root

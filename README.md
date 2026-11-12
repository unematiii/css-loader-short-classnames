# css-loader-shorter-classnames

[![CI](https://github.com/unematiii/css-loader-short-classnames/actions/workflows/test.yml/badge.svg)](https://github.com/unematiii/css-loader-short-classnames/actions/workflows/test.yml)
[![View on npm](https://img.shields.io/npm/v/css-loader-shorter-classnames)](https://www.npmjs.com/package/css-loader-shorter-classnames)
[![Weekly npm downloads](https://badgen.net/npm/dw/css-loader-shorter-classnames)](https://www.npmjs.com/package/css-loader-shorter-classnames)
[![GitHub license](https://img.shields.io/github/license/unematiii/css-loader-short-classnames)](https://github.com/unematiii/css-loader-short-classnames/blob/main/LICENSE)

Generate short, unique CSS Module class names for webpack projects using either `css-loader` or webpack's native CSS support.

## Install

```sh
npm install --save-dev css-loader-shorter-classnames
```

## With `css-loader`

`getLocalIdentName()` returns the `getLocalIdent` callback expected by `css-loader`. Existing users can continue using this API.

```js
const { getLocalIdentName } = require("css-loader-shorter-classnames");

module.exports = {
  module: {
    rules: [{
      test: /\.module\.css$/i,
      use: [{
        loader: "css-loader",
        options: { modules: { getLocalIdent: getLocalIdentName() } },
      }],
    }],
  },
};
```

## With webpack native CSS

Webpack's native CSS generator supports a `localIdentName` template function. The callback receives path data with `filename` and `local` values. Use `getNativeCssLocalIdentName()` there. Native CSS requires webpack 5.109 or later; see the [webpack native CSS guide](https://webpack.js.org/guides/native-css/).

```js
const { getNativeCssLocalIdentName } = require("css-loader-shorter-classnames");

module.exports = {
  experiments: { css: true },
  module: {
    generator: {
      "css/auto": {
        localIdentName: getNativeCssLocalIdentName(),
      },
    },
  },
};
```

Use `*.module.css` files with the `css/auto` type (webpack's default auto CSS handling) or configure a rule with `type: "css/module"` and its `generator.localIdentName` for a narrower scope.

## Options

Both factories accept an optional alphabet, prefix, and suffix:

```js
const { classNameAlphabet, getLocalIdentName } = require("css-loader-shorter-classnames");

const getLocalIdent = getLocalIdentName("abc", "_", "_");
// Names: _a_, _b_, _c_, _aa_, ...
```

The default alphabet is `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`. Names begin with a non-numeric character. If a prefix starts with a digit, `_` is prepended automatically. Avoid whitespace and characters invalid in CSS identifiers.

Names are allocated in encounter order within each resource path, and repeated requests for the same local name return the same value. For server rendering or builds that must produce identical names across separate compilations, use identical module visitation order and configuration. The default allocation is not a content hash.

## Development

```sh
npm ci
npm run lint
npm test
npm run typecheck
npm run build
npm run verify:integrations
```

The callback contract tests are in `src/index.spec.ts`. `npm run typecheck` also builds the package and checks consumer imports from the package root against webpack's `Configuration` type and the documented `css-loader` callback signature. Run `npm run verify:integrations` to build the tiny webpack fixtures in `test/fixtures/css-modules` and verify both emitted selectors/declarations and JavaScript class exports.

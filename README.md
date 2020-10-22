# A class name generator for css-loader with CSS Modules enabled.

[![Build Status](https://travis-ci.org/unematiii/css-loader-short-classnames.svg)](https://travis-ci.org/unematiii/css-loader-short-classnames)
[![Coverage Status](https://coveralls.io/repos/github/unematiii/css-loader-short-classnames/badge.svg)](https://coveralls.io/github/unematiii/css-loader-short-classnames)

## Description
Save some extra bytes on your final bundle by shortening class names from something like `[local]-[hash:base64:8]` down to `a` ... `z` ... `A` ... `Z` ... `a0` ... `ZZ` etc.

This package provides class name generator factory with default alphabet of `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`. Produced generator function always starts out with single letter character from the beginning of the alphabet and keeps increasing it while at the same time guaranteeing the uniqueness of the class names.

## Install

```
npm i css-loader-shorter-classnames -D
```

## Basic usage

```js
// Import class name generator factory
const { getLocalIdentName } = require('css-loader-shorter-classnames');

// Create generator
const getLocalIdent = getLocalIdentName();

// Supply created function as a loader options argument
{
  // ...
  loader: 'css-loader',
  options: {
    modules: {
      getLocalIdent,
    },
  },
},
```

For `css-loader` versions below `3.*`, `modules` options should be specified in loader `options` block instead:

```js
const { getLocalIdentName } = require('css-loader-shorter-classnames');
const getLocalIdent = getLocalIdentName();

// Loader options
{
  // ...
  loader: 'css-loader',
  options: {
    modules: true,
    getLocalIdent,
  },
},
```

## Enable only for production
```js
const { getLocalIdentName } = require('css-loader-shorter-classnames');

const getLocalIdent = getLocalIdentName();
const isProduction = process.env.NODE_ENV === 'production';

// Loader options
{
  // ...
  loader: 'css-loader',
  options: {
    modules: {
      localIdentName: '[local]-[hash:base64:8]',
      ...(isProduction ? { getLocalIdent } : {}),
    },
  },
},
```

## Custom alphabet, prefix and suffix
Optionally supply a custom alphabet and/or prefix and/or suffix.

NB! Watch out for spaces and other invalid characters. It is guaranteed that none of the generated class names start with a number.

If you supply a prefix that starts with a number, it will be automatically prefixed with `_`.

```js
const { classNameAlphabet, getLocalIdentName } = require('css-loader-shorter-classnames');

// Produces: 'a', 'b', 'c', 'aa', 'ba', ..., 'abcabca' etc.
const getLocalIdent = getLocalIdentName('abc');

// Produces: '_a', '_b', ..., '_aZ' etc.
const getLocalIdent = getLocalIdentName(classNameAlphabet, '_');

// Produces: '_000a', '_000b', ..., '_000aZ' etc.
const getLocalIdent = getLocalIdentName(classNameAlphabet, '000');

// Produces: '_a_', '_b_', ..., '_aZ_' etc.
const getLocalIdent = getLocalIdentName(classNameAlphabet, '_', '_');
```

## Usage with Vue CLI generated projects

`vue.config.js`:

```js
const { getLocalIdentName } = require('css-loader-shorter-classnames');

const getLocalIdent = getLocalIdentName();
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // ...
  css: {
    // ...
    loaderOptions: {
      css: {
        modules: {
          localIdentName: '[local]-[hash:base64:8]',
          ...(isProduction ? { getLocalIdent } : {}),
        },
      },
    },
    // ...
  },
  // ...
};
```

# css-loader-short-classnames

# A short class name generator for css-loader with CSS Modules enabled.

## Description
Save some extra bytes on your final bundle by shortening class names from something like `[local]-[hash:base64:8]` down to `a` ... `z` ... `A` ... `Z` ... `aA` ... `ZZ` etc.

This package provides class name generator factory with default alphabet of `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`. Produced generator function always starts out with single letter character from the beginning of the alphabet and keeps increasing it while at the same time guaranteeing the uniqueness of the class names.

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
      getLocalIdent: getLocalIdent,
    },
  },
},
```

## Enable only for production
```js
const { getLocalIdentName } = require('css-loader-shorter-classnames');

const isProduction = process.env.NODE_ENV === 'production';

// Loader options
{
  // ...
  loader: 'css-loader',
  options: {
    modules: {
      localIdentName: '[local]-[hash:base64:8]',
      ...(isProduction ? { getLocalIdent: getLocalIdentName() } : {}),
    },
  },
},
```

## Custom alphabet, prefix and suffix
Optionally supply a custom alphabet and/or prefix and/or suffix.

NB! Watch out for spaces and other invalid characters. If alphabet contains numbers, class names that would otherwise start with a number, will be automatically prefixed with `_` (eg `0` --> `_0`)). That is, unless you supply a prefix that doesn't start with a number yourself.

```js
const { classNamesAlphabet, getLocalIdentName } = require('css-loader-shorter-classnames');

// Produces: 'a', 'b', 'c', 'aa', 'ab', ... 'abcabca' etc.
const getLocalIdent = getLocalIdentName('abc');

// Produces: 'a', 'b', ..., '_0', '_1', ..., '_0a', ..., 'aa', 'a0', ... 'aZ' etc.
const getLocalIdent = getLocalIdentName(classNamesAlphabet.concat('0123456789'));

// Produces: '_a', '_b', ... '_0', ... '_aZ' etc.
const getLocalIdent = getLocalIdentName(classNamesAlphabet.concat('0123456789'), '_');

// Produces: '_000a', '_000b', ... '_0000', ... '_000aZ' etc.
const getLocalIdent = getLocalIdentName(classNamesAlphabet.concat('0123456789'), '000');

// Produces: '_a_', '_b_', ... '_aZ_' etc.
const getLocalIdent = getLocalIdentName(classNamesAlphabet, '_', '_');
```

## Usage with Vue CLI generated projects

`vue.config.js`:

```js
const { getLocalIdentName } = require('css-loader-shorter-classnames');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // ...
  css: {
    // ...
    loaderOptions: {
      css: {
        modules: {
          localIdentName: '[local]-[hash:base64:8]',
          ...(isProduction ? { getLocalIdent: getLocalIdentName() } : {}),
        },
      },
    },
    // ...
  },
  // ...
};
```

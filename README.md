# css-loader-short-classnames
# A short class name generator for css-loader with CSS Modules enabled.

## Description
Save some extra bytes on your final bundle by shortening class names from something like `[local]-[hash:base64:8]` down to `a` ... `z` ... `A` ... `Z` ... `aA` ... `ZZ` etc.

This package provides class name generator factory with default alphabet `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`. Produced generator function always starts out with single letter character from the beginning of the alphabet and keeps increasing it while at the same time guaranteeing the uniqueness of the class names.

## Install

```
npm i css-loader-shorter-classnames -D
```

## Basic usage

```
// Import class name generator factory
const { getLocalIdentName } = require('css-loader-shorter-classnames');

// Create generator (should be unique for each entry point)
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
```
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

## Custom alphabet
Optionally supply a custom alphabet.

NB! Watch out for numbers, spaces, and other invalid characters. Generator does not NOT guarantee that supplied character from alphabet, if number, will not end up as the first character of the class name.

```
const { getLocalIdentName } = require('css-loader-shorter-classnames');

// Produces class names like 'a', 'b', 'c', 'aa, 'ab', ..... 'abcabca' etc.
const getLocalIdent = getLocalIdentName('abc');
```

## Usage with Vue CLI generated projects

`vue.config.js`:

```
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

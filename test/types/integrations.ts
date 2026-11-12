import type { Configuration } from "webpack";
import {
  ClassNameGenerator,
  getLocalIdentName,
  getNativeCssLocalIdentName,
} from "../..";

// css-loader documents this callback contract, but does not ship TypeScript types.
const cssLoaderGetLocalIdent: ClassNameGenerator = getLocalIdentName();

// Check that the native adapter is assignable to webpack's actual config type.
export const nativeCssConfiguration: Configuration = {
  experiments: { css: true },
  module: {
    generator: {
      "css/auto": {
        localIdentName: getNativeCssLocalIdentName(),
      },
    },
  },
};

// Keep the legacy callback's documented signature covered too.
export const cssLoaderCallbackTypecheck: ClassNameGenerator = cssLoaderGetLocalIdent;

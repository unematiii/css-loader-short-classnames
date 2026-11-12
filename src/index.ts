export interface WebpackLoaderContext {
  resourcePath: string;
}

export type ClassNameGenerator = (
  context: WebpackLoaderContext,
  localIdentName: string,
  localName: string
) => string;

export interface NativeCssContext {
  /** Resource path relative to webpack's context. */
  filename?: string;
  /** The CSS module's original local identifier. */
  local?: string;
}

/** Function form accepted by webpack's native CSS `localIdentName` option. */
export type NativeCssLocalIdentName = (context: NativeCssContext) => string;

export const classNameAlphabet =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const containsNumbers = (input: string) => /\d/.test(input);

export class Generator {
  protected alphabet: string;
  protected counters: number[] = [];
  protected hasSafeAlphabet = true;

  public constructor(alphabet: string = classNameAlphabet) {
    if (!alphabet.length) {
      throw new Error("Alphabet must contain at least one character!");
    }

    this.alphabet = [...new Set(alphabet.split(""))].join("");

    if (containsNumbers(this.alphabet)) {
      this.hasSafeAlphabet = false;
      if (this.nextNotNumber(0) === -1) {
        throw new Error(
          "Alphabet must contain at least one non-numeric character!"
        );
      }
    }
  }

  public next() {
    return this.increment().countersToString();
  }

  protected countersToString() {
    const { alphabet, counters } = this;
    return counters.map((counter) => alphabet[counter]).join("");
  }

  protected increment(): Generator {
    const {
      alphabet: { length: digitsCount },
      counters: { length },
    } = this;
    const lastDigit = digitsCount - 1;

    for (let i = 0; i < length; i++) {
      if (this.counters[i] < lastDigit) {
        if (i === 0) {
          const next = this.nextNotNumber(this.counters[i] + 1);
          if (next !== -1) {
            this.counters[i] = next;
            return this;
          } else if (i < length - 1) {
            this.counters[i] = this.nextNotNumber(0);
          }
        } else {
          ++this.counters[i];
          return this;
        }
      } else if (i < length - 1) {
        this.counters[i] = i === 0 ? this.nextNotNumber(0) : 0;
      }
    }

    this.counters = Array.apply(null, Array(length + 1)).map((_, index) =>
      index === 0 ? this.nextNotNumber(0) : 0
    );

    return this;
  }

  protected isNumber(charIndex: number) {
    return containsNumbers(this.alphabet[charIndex]);
  }

  protected nextNotNumber(charIndex: number) {
    if (this.hasSafeAlphabet) {
      return charIndex;
    }
    for (let k = charIndex; k < this.alphabet.length; k++) {
      if (!this.isNumber(k)) {
        return k;
      }
    }
    return -1;
  }
}

const createGenerator = (
  alphabet?: string,
  prefix?: string,
  suffix?: string
) => {
  const generator = new Generator(alphabet);

  if (prefix || suffix) {
    const safePrefix =
      !!prefix && containsNumbers(prefix.charAt(0)) ? `_${prefix}` : prefix;
    return () => `${safePrefix || ""}${generator.next()}${suffix || ""}`;
  }

  return generator.next.bind(generator);
};

export const getLocalIdentName = (
  alphabet?: string,
  prefix?: string,
  suffix?: string
): ClassNameGenerator => {
  const classes: Record<string, Record<string, string>> = Object.create(null);
  const classNameGenerator = createGenerator(alphabet, prefix, suffix);
  const getClassName = (path: string, localName: string): string => {
    classes[path] ||= Object.create(null);
    classes[path][localName] ||= classNameGenerator();
    return classes[path][localName];
  };

  return (
    { resourcePath }: WebpackLoaderContext,
    _: string,
    localName: string
  ) => getClassName(resourcePath, localName);
};

/**
 * Creates the function form of webpack's native CSS `localIdentName` option.
 * Native CSS passes webpack path data containing `filename` and `local`.
 */
export const getNativeCssLocalIdentName = (
  alphabet?: string,
  prefix?: string,
  suffix?: string
): NativeCssLocalIdentName => {
  const classes: Record<string, Record<string, string>> = Object.create(null);
  const classNameGenerator = createGenerator(alphabet, prefix, suffix);
  return ({ filename, local }) => {
    if (typeof filename !== "string" || typeof local !== "string") {
      throw new Error(
        "Webpack native CSS localIdentName requires filename and local path data."
      );
    }
    classes[filename] ||= Object.create(null);
    classes[filename][local] ||= classNameGenerator();
    return classes[filename][local];
  };
};

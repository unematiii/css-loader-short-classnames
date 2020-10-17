export interface WebpackLoaderContext {
  resourcePath: string;
}

export type ClassNameGenerator = (
  context: WebpackLoaderContext,
  localIdentName: string,
  localName: string
) => string;

export const classNamesAlphabet =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const containsNumbers = (input: string) => /\d/.test(input);

class Generator {
  protected counters: number[] = [];

  public constructor(protected readonly alphabet: string = classNamesAlphabet) {
    if (!alphabet.length) {
      throw new Error("Alphabet must contain at least one character!");
    }

    if (this.nextNotNumber(0) === -1) {
      throw new Error(
        "Alphabet must contain at least one non-numeric character!"
      );
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
    for (let k = charIndex; k < this.alphabet.length; k++) {
      if (!this.isNumber(k)) {
        return k;
      }
    }
    return -1;
  }
}

const createGenerator = (
  alphabet: string = classNamesAlphabet,
  prefix?: string,
  suffix?: string
) => {
  const generator = new Generator(alphabet);

  if (prefix || suffix) {
    const safePrefix =
      !!prefix && !containsNumbers(prefix.charAt(0)) ? `_${prefix}` : prefix;
    return () => `${safePrefix || ""}${generator.next()}${suffix || ""}`;
  }

  return generator.next;
};

export const getLocalIdentName = (
  alphabet: string = classNamesAlphabet,
  prefix?: string,
  suffix?: string
): ClassNameGenerator => {
  const classes: Record<string, Record<string, string>> = {};
  const classNameGenerator = createGenerator(alphabet, prefix, suffix);
  const getClassName = (path: string, localName: string): string => {
    classes[path] ||= {};
    classes[path][localName] ||= classNameGenerator();
    return classes[path][localName];
  };

  return (
    { resourcePath }: WebpackLoaderContext,
    _: string,
    localName: string
  ) => getClassName(resourcePath, localName);
};

import incstr from "incstr";

interface WebpackLoaderContext {
  resourcePath: string;
}

export type ClassNameGenerator = (
  context: WebpackLoaderContext,
  _: string,
  localName: string
) => string;

export const classNamesAlphabet =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const containsNumbers = (input: string) => /\d/.test(input);

const createGenerator = (
  alphabet: string = classNamesAlphabet,
  prefix?: string,
  suffix?: string
) => {
  const generator = incstr.idGenerator({ alphabet, prefix, suffix });

  const hasNumericAlphabet = containsNumbers(
    (!!prefix && alphabet.concat(prefix.charAt(0))) || alphabet
  );
  const hasNumberSafePrefix = !!prefix && !containsNumbers(prefix.charAt(0));

  if (hasNumericAlphabet && !hasNumberSafePrefix) {
    return () => {
      const className = generator();
      return containsNumbers(className.charAt(0)) ? `_${className}` : className;
    };
  }

  return generator;
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

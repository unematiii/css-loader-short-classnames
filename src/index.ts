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

export const getLocalIdentName = (
  alphabet: string = classNamesAlphabet
): ClassNameGenerator => {
  const classes: Record<string, Record<string, string>> = {};
  const classNameGenerator = incstr.idGenerator({ alphabet });
  const getClassName = (path: string, localName: string): string => {
    classes[path] ||= {};
    classes[path][localName] ||= classNameGenerator();
    return classes[path][localName];
  };

  return ({ resourcePath }: WebpackLoaderContext, _: string, localName: string) =>
    getClassName(resourcePath, localName);
};

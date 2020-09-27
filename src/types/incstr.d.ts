declare module "incstr" {
  declare interface IdGeneratorOptions {
    alphabet?: string;
    lastId?: string;
    numberlike?: boolean;
    prefix?: string;
    suffix?: string;
  }

  declare interface incstr {
    alphabet: string;
    numberlike: false;
    (str?: string, alph = incstr.alphabet, numlike = incstr.numberlike): string;
    idGenerator: (options?: IdGeneratorOptions) => () => string;
  }

  const module: incstr;

  export default module;
}

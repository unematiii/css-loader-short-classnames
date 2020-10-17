import { classNameAlphabet, Generator, getLocalIdentName } from "./index";

const combinationsCount = (alphabet: string, length: number) =>
  Array.apply(null, Array(length)).reduce<number>(
    (current, _, index) => current + Math.pow(alphabet.length, index + 1),
    0
  );

const combinationsCountWithMissingChars = (
  alphabet: string,
  length: number,
  skipCharsCount: number
) =>
  Array.apply(null, Array(length)).reduce<number>(
    (current, _, index) =>
      current +
      Math.pow(alphabet.length, index) * (alphabet.length - skipCharsCount),
    0
  );

describe("css-loader-short-classnames", () => {
  describe("Generator", () => {
    let map: Record<string, boolean>;

    beforeEach(() => {
      map = {};
    });

    it("generates incremental and collision free strings out of default alphabet", () => {
      const count = combinationsCountWithMissingChars(classNameAlphabet, 2, 10);

      const generator = new Generator();

      for (let i = 0; i < count; i++) {
        const id = generator.next();

        expect(map[id]).toBeUndefined();

        map[id] = true;
      }

      expect(map["a"]).toBe(true);
      expect(map["f0"]).toBe(true);
      expect(map["gY"]).toBe(true);
      expect(map["Z9"]).toBe(true);

      expect(map["0Z"]).toBeUndefined();
      expect(map["aaa"]).toBeUndefined();
    });

    it("generates incremental and collision free strings out of supplied alphabet", () => {
      const alphabet = "abcd";
      const count = combinationsCount(alphabet, 3);

      const generator = new Generator(alphabet);

      for (let i = 0; i < count; i++) {
        const id = generator.next();

        expect(map[id]).toBeUndefined();

        map[id] = true;
      }

      expect(map["a"]).toBe(true);
      expect(map["abc"]).toBe(true);
      expect(map["ddd"]).toBe(true);

      expect(map["e"]).toBeUndefined();
      expect(map["dddd"]).toBeUndefined();
    });

    ["abcd123", "123abcd", "a1b2c3d"].forEach((alphabet) => {
      it(`generates strings, whereas none starts out with a number, out of ${alphabet} `, () => {
        const count = combinationsCountWithMissingChars(alphabet, 3, 3);

        const generator = new Generator(alphabet);

        for (let i = 0; i < count; i++) {
          const id = generator.next();

          expect(map[id]).toBeUndefined();
          expect(["1", "2", "3"]).not.toContain(id.charAt(0));

          map[id] = true;
        }

        expect(map["a"]).toBe(true);
        expect(map["b3c"]).toBe(true);
        expect(map["a2"]).toBe(true);
        expect(map["a21"]).toBe(true);
        expect(map["d33"]).toBe(true);

        expect(map["a4"]).toBeUndefined();
        expect(map["d333"]).toBeUndefined();
      });
    });

    it("throws error if supplied alphabet doesn't contain any characters", () => {
      expect(() => new Generator("")).toThrowError();
    });

    it("throws error if supplied alphabet only contains numbers", () => {
      expect(() => new Generator("1234567890")).toThrowError();
    });
  });

  describe("getLocalIdentName", () => {
    let map: Record<string, Record<string, string>>;

    const modules = [
      {
        resourcePath: "/dirA/component",
        classes: [
          "class-a",
          "class-b",
          "class-c",
          "class-d",
          "class-e",
          "class-f",
          "class-g",
          "class-h",
        ],
      },
      {
        resourcePath: "/dirB/component",
        classes: [
          "class-a",
          "class-b",
          "class-a",
          "class-d",
          "class-e",
          "class-d",
          "class-g",
          "class-h,",
        ],
      },
      {
        resourcePath: "/dirC/componentA",
        classes: [
          "class-a",
          "class-d",
          "class-c",
          "class-d",
          "class-e",
          "class-f",
          "class-b",
          "class-h,",
        ],
      },
      {
        resourcePath: "/dirC/componentB",
        classes: [
          "class-a",
          "class-b",
          "class-c",
          "class-d",
          "class-e",
          "class-f",
          "class-g",
          "class-h,",
        ],
      },
      {
        resourcePath: "/dirD/component",
        classes: [
          "class-a",
          "class-e",
          "class-c",
          "class-d",
          "class-e",
          "class-f",
          "class-g",
          "class-a,",
        ],
      },
    ];

    const modulesUniqueClassNamesCount = Object.values(modules).reduce<number>(
      (current, module) => current + [...new Set(module.classes)].length,
      0
    );

    const resourcePathA = "moduleA";
    const resourcePathB = "moduleB";

    beforeEach(() => {
      map = {};
    });

    [undefined, "012Abc", "abc", "Abc210", "aabb"].forEach((alphabet) => {
      const alphabetName = alphabet
        ? `supplied alphabet of '${alphabet}'`
        : "default alphabet";
      it(`creates generator with ${alphabetName} and produces collision free class names`, () => {
        const getLocalIdent = getLocalIdentName(alphabet);

        for (const { resourcePath, classes } of modules) {
          map[resourcePath] ||= {};

          for (const localName of classes) {
            const className = getLocalIdent({ resourcePath }, "", localName);

            expect([className, undefined]).toContain(
              map[resourcePath][localName]
            );

            map[resourcePath][localName] = className;
          }
        }

        const allGeneratedClassNames = Object.values(map).reduce<string[]>(
          (all, currentModule) => [...all, ...Object.values(currentModule)],
          []
        );
        const uniqueClassNames = [...new Set(allGeneratedClassNames)];

        expect(allGeneratedClassNames.length).toBe(uniqueClassNames.length);
        expect(uniqueClassNames.length).toBe(modulesUniqueClassNamesCount);
      });
    });

    it("creates generator with custom alphabet and prefix and produces prefixed class names", () => {
      const getLocalIdent = getLocalIdentName("abc", "bbb");

      expect(
        getLocalIdent({ resourcePath: resourcePathA }, "", "class-a")
      ).toBe("bbba");
      expect(
        getLocalIdent({ resourcePath: resourcePathA }, "", "class-b")
      ).toBe("bbbb");

      expect(
        getLocalIdent({ resourcePath: resourcePathB }, "", "class-a")
      ).toBe("bbbc");
      expect(
        getLocalIdent({ resourcePath: resourcePathB }, "", "class-b")
      ).toBe("bbbaa");
    });

    it("creates generator with custom alphabet and numeric prefix and produces prefixed class names", () => {
      const getLocalIdent = getLocalIdentName("abc", "0a");

      expect(
        getLocalIdent({ resourcePath: resourcePathA }, "", "class-a")
      ).toBe("_0aa");
      expect(
        getLocalIdent({ resourcePath: resourcePathA }, "", "class-b")
      ).toBe("_0ab");

      expect(
        getLocalIdent({ resourcePath: resourcePathB }, "", "class-a")
      ).toBe("_0ac");
      expect(
        getLocalIdent({ resourcePath: resourcePathB }, "", "class-b")
      ).toBe("_0aaa");
    });

    it("creates generator with custom alphabet, prefix and suffix and produces class names with prefix and suffix", () => {
      const getLocalIdent = getLocalIdentName("abc", "_a", "b_");

      expect(
        getLocalIdent({ resourcePath: resourcePathA }, "", "class-a")
      ).toBe("_aab_");
      expect(
        getLocalIdent({ resourcePath: resourcePathA }, "", "class-b")
      ).toBe("_abb_");

      expect(
        getLocalIdent({ resourcePath: resourcePathB }, "", "class-a")
      ).toBe("_acb_");
      expect(
        getLocalIdent({ resourcePath: resourcePathB }, "", "class-b")
      ).toBe("_aaab_");
    });

    it("creates generator with custom alphabet, suffix and produces class names with suffix", () => {
      const getLocalIdent = getLocalIdentName("abc", undefined, "0");

      expect(
        getLocalIdent({ resourcePath: resourcePathA }, "", "class-a")
      ).toBe("a0");
      expect(
        getLocalIdent({ resourcePath: resourcePathA }, "", "class-b")
      ).toBe("b0");

      expect(
        getLocalIdent({ resourcePath: resourcePathB }, "", "class-a")
      ).toBe("c0");
      expect(
        getLocalIdent({ resourcePath: resourcePathB }, "", "class-b")
      ).toBe("aa0");
    });
  });
});

declare module "bun:test" {
  export const afterAll: (...args: any[]) => void;
  export const afterEach: (...args: any[]) => void;
  export const beforeAll: (...args: any[]) => void;
  export const beforeEach: (...args: any[]) => void;
  export const describe: (...args: any[]) => void;
  export const expect: any;
  export const it: (...args: any[]) => void;
  export const mock: ((...args: any[]) => any) & { restore: () => void };
}

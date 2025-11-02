import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";

type Restorable = { mockRestore: () => void };

const tracked = new Set<Restorable>();

const track = <T extends Restorable>(value: T): T => {
  tracked.add(value);
  return value;
};

export const vi = {
  spyOn<T extends object, K extends keyof T>(target: T, method: K) {
    return track(spyOn(target, method));
  },
  fn<T extends (...args: any[]) => any>(implementation?: T) {
    return track(mock(implementation));
  },
  mock<T extends (...args: any[]) => any>(implementation?: T) {
    return track(mock(implementation));
  },
  restoreAllMocks() {
    for (const value of tracked) {
      value.mockRestore();
    }
    tracked.clear();
  },
};

export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
};

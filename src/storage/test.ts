import 'fake-indexeddb/auto';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import { storage } from './index';
import { DbItemNotFound } from './errors';

type Value = {
  a: number;
};

const value: Value = { a: 222 };

describe('storage', () => {
  beforeEach(() => {
    /* eslint-disable */
    window.indexedDB = new FDBFactory();
    /* eslint-enable */
  });

  test('defined', () => {
    expect(storage).toBeDefined();
  });

  test('to get an invalid key', async () => {
    try {
      const db = storage<Value>({ name: 'test' });
      await db.get({ key: 'key5' });
    } catch (e) {
      expect(e).toBeInstanceOf(DbItemNotFound);
    }
  });

  test('to get and set item', async () => {
    const db = storage<Value>({ name: 'test' });
    await db.set({ key: 'key2', value });
    await db.set({ key: 'key', value });
    const result = await db.get({ key: 'key' });
    expect(result).toEqual(value);
    const result2 = await db.get({ key: 'key2' });
    expect(result2).toEqual(value);
  });

  test('to find a condition', async () => {
    const db = storage<Value>({ name: 'test' });
    await db.set({ key: 'key2', value });
    await db.set({ key: 'key', value });
    const result = await db.find(({ a }) => a === 222);
    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "a": 222,
        },
        Object {
          "a": 222,
        },
      ]
    `);
  });

  test('to multiple instances do not override each other', async () => {
    try {
      const db = storage<Value>({ name: 'test' });
      const db2 = storage({ name: 'test2' });
      await db.set({ key: 'key', value });
      await db2.set({ key: 'key5', value });
      await db.get({ key: 'key5' });
    } catch (e) {
      expect(e).toBeInstanceOf(DbItemNotFound);
    }
  });

  test('to update same item multiple times', async () => {
    const db = storage<Value>({ name: 'test' });
    await db.set({ key: 'key', value });
    await db.set({
      key: 'key',
      value: {
        a: 333,
      },
    });
    const result = await db.get({ key: 'key' });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "a": 333,
      }
    `);
  });
});

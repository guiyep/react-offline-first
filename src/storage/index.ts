import { createInstance } from './strategies/indexed-db';
import { DbItemNotFound } from './errors';

import type { KeyProp, KeyValueProp, NameProp, Storage, ConditionProp, Store } from './types';

export const createStore = <T>({ name }: NameProp): Store<T> => createInstance({ name });

export const get = async <T>({ key }: KeyProp, Store: Store<T>): Promise<T> => {
  const result = await Store.getItem(key);
  if (result === null || result === undefined) {
    throw new DbItemNotFound(key);
  }
  return result.data;
};

export const set = <T>({ key, value }: KeyValueProp<T>, Store: Store<T>): Promise<unknown> =>
  Store.setItem(key, { timestamp: +new Date(), data: value });

export const find = async <T>(condition: ConditionProp<T>, Store: Store<T>) => {
  const result: T[] = [];
  await Store.iterate(({ data }) => {
    if (condition(data)) {
      result.push(data);
    }
  });
  return result;
};

export const storage = <T>({ name }: NameProp): Storage<T> => {
  const Store = createStore<T>({ name });
  return {
    get: ({ key }) => get({ key }, Store),
    set: ({ key, value }) => set({ key, value }, Store),
    find: (condition) => find(condition, Store),
  };
};

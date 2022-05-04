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

export const deleteItem = async <T>({ key }: KeyProp, Store: Store<T>): Promise<void> =>
  Store.deleteItem(key)

export const set = <T>({ key, value }: KeyValueProp<T>, Store: Store<T>): Promise<unknown> =>
  Store.setItem(key, { timestamp: +new Date(), data: value });

export const find = async <T>(condition: ConditionProp<T>, Store: Store<T>): Promise<T[]> => {
  const result: T[] = [];
  await Store.iterate(({ data }) => {
    if (condition(data)) {
      result.push(data);
    }
  });

  return result;
};

export const getFirst = async <T>(Store: Store<T>): Promise<T | null> => {
  let result: T | null = null;

  await Store.iterate(({ data }, index, breakLoop) => {
    if (index === 0) {
      result = data;
      breakLoop()
    }
  });

  return result;
};

export const deleteFirst = async <T>(Store: Store<T>): Promise<void> => {
  let result: string | null = null;

  await Store.iterate(({ key }, index, breakLoop) => {
    if (index === 0) {
      result = key;
      breakLoop()
    }
  });

  if (result !== null) {
    return deleteItem({ key: result }, Store);
  }

  return Promise.reject();
};

export const hasAny = async<T>(Store: Store<T>): Promise<boolean> => {
  if (await getFirst(Store) !== null) {
    return true;
  }
  return false;
}

export const storage = <T>({ name }: NameProp): Storage<T> => {
  const Store = createStore<T>({ name });
  return {
    get: ({ key }) => get({ key }, Store),
    set: ({ key, value }) => set({ key, value }, Store),
    delete: ({ key }) => deleteItem({ key }, Store),
    find: (condition) => find(condition, Store),
    getFirst: () => getFirst(Store),
    deleteFirst: () => deleteFirst(Store),
    hasAny: () => hasAny(Store),
  };
};

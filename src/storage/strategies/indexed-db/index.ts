import { configuration, configure } from './config';
import { DbNotFound } from './errors';

import type { NameProp, Store, IterateFunction } from '../../types';
import type { InternalData, InternalDataNoKey } from '../types';
import type { InternalStore } from './types';

const asDbPromise = async <T>(f: () => IDBRequest<any>, store: InternalStore): Promise<T> => {
  await store.promise;
  return new Promise((resolve, reject) => {
    const request = f();

    request.onsuccess = () => {
      resolve(request.result as T);
    };

    request.onerror = (e) => {
      reject(e);
    };
  });
};

export const getItem = <T>(key: string, store: InternalStore): Promise<T> =>
  asDbPromise<T>(() => {
    const { db, name } = store;

    if (!db) {
      throw new DbNotFound();
    }

    const readTransaction = db.transaction([name]);
    const objectStore = readTransaction.objectStore(name);
    return objectStore.get(key);
  }, store);

const addInternal = <T>(data: T, store: InternalStore): Promise<unknown> =>
  asDbPromise(() => {
    const { db, name } = store;

    if (!db) {
      throw new DbNotFound();
    }

    const userReadWriteTransaction = db.transaction(name, 'readwrite');
    const newObjectStore = userReadWriteTransaction?.objectStore(name);
    return newObjectStore?.add(data);
  }, store);

const putInternal = <T>(data: T, store: InternalStore): Promise<unknown> =>
  asDbPromise(() => {
    const { db, name } = store;

    if (!db) {
      throw new DbNotFound();
    }

    const userReadWriteTransaction = db.transaction(name, 'readwrite');
    const newObjectStore = userReadWriteTransaction.objectStore(name);
    return newObjectStore.put(data);
  }, store);

export const setItem = async <T>(data: InternalData<T>, store: InternalStore): Promise<unknown> => {
  const value = await getItem(data.key, store);
  if (value === undefined) {
    return addInternal(data, store);
  }
  return putInternal(data, store);
};

export const deleteItem = async (key: string, store: InternalStore): Promise<void> =>
  asDbPromise<void>(() => {
    const { db, name } = store;

    if (!db) {
      throw new DbNotFound();
    }

    const readTransaction = db.transaction([name], 'readwrite');
    const objectStore = readTransaction.objectStore(name);
    return objectStore.delete(key);
  }, store);

// export const iterate = async <T>(f: IterateFunction<T>, store: InternalStore): Promise<void> => {
//   const list = await asDbPromise<InternalData<T>[]>(() => {
//     const { db, name } = store;

//     if (!db) {
//       throw new DbNotFound();
//     }

//     const readTransaction = db.transaction([name]);
//     const objectStore = readTransaction.objectStore(name);
//     return objectStore.getAll();
//   }, store);

//   const thisList = list || [];
//   let breakLoop = false;

//   const breakLoopFunction = () => {
//     breakLoop = true;
//   };

//   for (let i = 0; i < thisList.length; i++) {
//     if (breakLoop === false) {
//       f(list[i], i, breakLoopFunction);
//     } else {
//       break;
//     }
//   }
// };

export const iterate = async <T>(f: IterateFunction<T>, store: InternalStore): Promise<void> => {
  await store.promise;

  return new Promise((resolve, reject) => {
    const { db, name } = store;

    if (!db) {
      throw new DbNotFound();
    }

    const trans = db.transaction([name], 'readwrite');
    const objectStore = trans.objectStore(name);
    const request = objectStore.openCursor();

    let breakLoop = false;
    let iterator = 0;

    const breakLoopFunction = () => {
      breakLoop = true;
    };

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor !== undefined && cursor !== null && breakLoop === false) {
        const result = cursor.value as InternalData<T>;
        f(result, iterator, breakLoopFunction);
        iterator++;
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = (e) => {
      reject(e);
    };
  });
};

export const createInstance = <T>({ name }: NameProp): Store<T> => {
  let resolveCreate: () => void;
  let rejectCreate: () => void;

  const result: InternalStore = {
    promise: new Promise((resolve, reject) => {
      resolveCreate = resolve;
      rejectCreate = reject;
    }),
    error: null,
    db: null,
    version: 0,
    name,
  };

  if (!window) {
    throw new Error('window need to be present');
  }

  const request = window.indexedDB.open(name, configuration.version);

  request.onerror = (e) => {
    result.error = e;
    rejectCreate();
  };

  request.onsuccess = () => {
    result.db = request.result;
    resolveCreate();
  };

  request.onupgradeneeded = (event) => {
    result.db = request.result;
    result.version = event.oldVersion || 0;
    configure({ name, db: result.db, version: result.version });
  };

  return {
    getItem: (key: string) => getItem(key, result),
    setItem: (key: string, objectToSave: InternalDataNoKey<T>) =>
      setItem(
        {
          key,
          timestamp: objectToSave.timestamp,
          data: objectToSave.data,
        },
        result,
      ),
    iterate: (iterateFunction: IterateFunction<T>) => iterate(iterateFunction, result),
    deleteItem: (key: string) => deleteItem(key, result),
  };
};

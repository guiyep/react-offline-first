import type { Configure } from './types';

export const configuration = {
  version: 1,
};

export const configure = ({ name, db, version }: Configure) => {
  if (version === 0) {
    const objectStore = db.createObjectStore(name, { keyPath: 'key' });
    objectStore.createIndex('key', 'key', { unique: true });
    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
    objectStore.createIndex('data', 'data', { unique: false });
  }
};

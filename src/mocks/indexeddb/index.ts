import 'fake-indexeddb/auto';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';

export const mockIndexedDb = () => {
  /* eslint-disable */
  window.indexedDB = new FDBFactory();
  /* eslint-enable */
}
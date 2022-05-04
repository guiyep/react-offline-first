import { mockIndexedDb } from '../../mocks/indexeddb';
import { QueueStorage } from "./index";

describe('QueueStorage', () => {
  beforeEach(() => {
    mockIndexedDb();
  });

  test('to be defined', () => {
    expect(QueueStorage).toBeDefined();
  })

  test('to have storage', () => {
    const queueStorage = new QueueStorage('test');
    expect(queueStorage.storage).toBeDefined();
    expect(queueStorage.storageDlq).toBeDefined();
  })
})
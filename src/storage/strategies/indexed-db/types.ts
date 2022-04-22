import type { InternalData } from '../types';

export type InternalStore = {
  promise: Promise<void>;
  version: number;
  error: Event | null;
  db: IDBDatabase | null;
  name: string;
};

export type IterateFunction = <T>(value: InternalData<T>) => void;

export type Configure = {
  name: string;
  db: IDBDatabase;
  version: number;
};

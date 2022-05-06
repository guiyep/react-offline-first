import type { InternalDataNoKey, InternalData } from './strategies/types';

type Key = string;

export type KeyProp = {
  key: Key;
};

export type KeyValueProp<T> = {
  key: Key;
  value: T;
};

export type NameProp = {
  name: string;
};

export type ConditionProp<T> = (prop: T) => boolean;

export type Storage<T> = {
  get: (props: KeyProp) => Promise<T>;
  delete: (props: KeyProp) => Promise<void>;
  set: (props: KeyValueProp<T>) => Promise<unknown>;
  find: (condition: ConditionProp<T>) => Promise<T[]>;
  getFirst: (count: number) => Promise<T | null>;
  deleteFirst: (count: number) => Promise<void>;
  hasAny: () => Promise<boolean>;
};

export type IterateFunction<T> = (value: InternalData<T>, index: number, breakLoop: () => void) => void;

export type Store<T> = {
  getItem: (key: string) => Promise<InternalData<T>>;
  deleteItem: (key: string) => Promise<void>;
  setItem: (key: string, data: InternalDataNoKey<T>) => Promise<unknown>;
  iterate: (condition: IterateFunction<T>) => Promise<void>;
};

export type StorageService = <T>({ name }: NameProp) => Storage<T>;

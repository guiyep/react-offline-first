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
  set: (props: KeyValueProp<T>) => Promise<unknown>;
  find: (condition: ConditionProp<T>) => Promise<T[]>;
};

export type IterateFunction<T> = (value: InternalData<T>) => void;

export type Store<T> = {
  getItem: (key: string) => Promise<InternalData<T>>;
  setItem: (key: string, data: InternalDataNoKey<T>) => Promise<unknown>;
  iterate: (condition: IterateFunction<T>) => Promise<void>;
};

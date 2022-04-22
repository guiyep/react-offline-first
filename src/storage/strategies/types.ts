export type InternalDataNoKey<T> = {
  timestamp: number;
  data: T;
};

export interface InternalData<T> extends InternalDataNoKey<T> {
  key: string;
}

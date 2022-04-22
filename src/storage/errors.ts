export class DbItemNotFound extends Error {
  constructor(key: string) {
    super(`Db: Item not found with key: ${key}`);
    this.name = 'DbItemNotFound';
  }
}

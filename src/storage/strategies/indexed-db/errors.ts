export class DbNotFound extends Error {
  constructor() {
    super('Db: The database was not found');
    this.name = 'DbNotFound';
  }
}

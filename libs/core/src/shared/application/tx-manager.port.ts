export interface TransactionManagerPort<TUow> {
  runInTransaction<T>(work: (uow: TUow) => Promise<T>): Promise<T>;
}

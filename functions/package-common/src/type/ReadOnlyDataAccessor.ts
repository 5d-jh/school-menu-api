export interface ReadOnlyDataAccessor<Q, R> {
  closeConnection(): any;

  get(query: Q): Promise<R>
}

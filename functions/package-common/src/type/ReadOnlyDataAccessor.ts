export interface ReadOnlyDataAccessor<Q, R> {
  get(query: Q): Promise<R>
}

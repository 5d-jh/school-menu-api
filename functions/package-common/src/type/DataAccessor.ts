export interface DataAccessor<T> {
    get(): Promise<T>;
    put(data: T);
}
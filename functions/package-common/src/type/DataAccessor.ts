export interface DataAccessor<T> {
    setParameters(...any): DataAccessor<T>;
    close(): any;
}

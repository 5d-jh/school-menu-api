import { ReadOnlyDataAccessor } from './ReadOnlyDataAccessor'

export interface DataAccessor<Q, T> extends ReadOnlyDataAccessor<Q, T> {
    put(T): Promise<void>

    put<T2>(entity: T2): Promise<void>
}

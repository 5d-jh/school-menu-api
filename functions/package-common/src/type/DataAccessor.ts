import { ReadOnlyDataAccessor } from './ReadOnlyDataAccessor'
import { firestore } from 'firebase-admin'

export interface DataAccessor<Q, T> extends ReadOnlyDataAccessor<Q, T> {
    put(T): Promise<firestore.WriteResult>
}

export interface Crawler<T, Q> {
    get(identifier: Readonly<Q>): Promise<T>
    shouldSave(): boolean
}

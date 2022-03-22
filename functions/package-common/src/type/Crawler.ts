export interface Crawler<T, Identifier> {
    get(identifier: Readonly<Identifier>): Promise<T>
    shouldSave(): boolean
}

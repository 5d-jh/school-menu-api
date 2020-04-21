export interface Crawler<T> {
    get(): Promise<T>
    shouldSave(): boolean
}
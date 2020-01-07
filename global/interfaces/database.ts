export default interface Database {
    get(any): Promise<any>
    put(any): Promise<any>
    close(): Promise<void>
}
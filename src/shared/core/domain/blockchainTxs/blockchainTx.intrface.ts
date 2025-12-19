export interface BlockchainTx<T> {
    value(): Promise<T>
}
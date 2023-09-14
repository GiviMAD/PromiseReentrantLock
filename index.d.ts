interface UnlockFn {
    (): void;
}
export declare class ReentrantLock {
    private current?;
    private last?;
    private readonly chainNoop;
    private readonly chainNext;
    acquire(): Promise<UnlockFn>;
    lock<T>(op: () => Promise<T>): Promise<T>;
}
export {};

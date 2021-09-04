declare type ReentrantLockReleaser = () => void;
export declare class ReentrantLock {
    private current?;
    private last?;
    private next;
    acquire(): Promise<ReentrantLockReleaser>;
    lock<T>(op: () => Promise<T>): Promise<T>;
}
export {};

interface UnlockFn { (): void; }
interface LockLinkedFn {
    (): void;
    next?: LockLinkedFn;
}
export class ReentrantLock {
    private current?: LockLinkedFn;
    private last?: LockLinkedFn;
    private readonly chainNoop: LockLinkedFn = () => void (0);
    private readonly chainNext: UnlockFn = () => {
        if (this.current === this.last) {
            this.current = this.last = undefined;
        } else {
            ((this.current as LockLinkedFn).next as LockLinkedFn)();
        }
    }
    public acquire(): Promise<UnlockFn> {
        if (!this.last) {
            let noop: LockLinkedFn | undefined = this.current = this.last = this.chainNoop;
            return Promise.resolve(() => {
                if (noop) {
                    noop = undefined;
                    this.chainNext();
                }
            });
        } else {
            return new Promise((resolve: (unlockFn: UnlockFn) => void) => {
                let lockChainFn: LockLinkedFn | undefined = () => {
                    if (lockChainFn) {
                        this.current = lockChainFn;
                        lockChainFn = undefined;
                        resolve(this.chainNext);
                    }
                };
                this.last = (this.last as LockLinkedFn).next = lockChainFn;
            });
        }
    }
    public lock<T>(op: () => Promise<T>) {
        return this.acquire().then(unlock => op().finally(unlock));
    }
}
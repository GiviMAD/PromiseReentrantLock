
type ReentrantLockReleaser = () => void;
interface ReentrantLockedChainItem {
    (): void;
    next?: ReentrantLockedChainItem;
}
export class ReentrantLock {
    private current?: ReentrantLockedChainItem;
    private last?: ReentrantLockedChainItem;
    private next = () => {
        if (this.current === this.last) {
            this.current = undefined;
            this.last = undefined;
        } else if (this.current && this.current.next) {
            this.current.next();
        }
    };
    acquire(): Promise<ReentrantLockReleaser> {
        if (!this.last) {
            /* c8 ignore next */
            this.current = this.last = () => null;
            return Promise.resolve(this.next);
        } else {
            return new Promise((resolve, reject) => {
                const lockChainItem = () => {
                    this.current = lockChainItem;
                    resolve(this.next);
                };
                this.last = (this.last as ReentrantLockedChainItem).next = lockChainItem;
            });
        }
    }
    lock<T>(op: () => Promise<T>) {
        return this.acquire().then(releaser => op().finally(releaser));
    }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReentrantLock = void 0;
class ReentrantLock {
    constructor() {
        this.chainNoop = () => void (0);
        this.chainNext = () => {
            if (this.current === this.last) {
                this.current = this.last = undefined;
            }
            else {
                this.current.next();
            }
        };
    }
    acquire() {
        if (!this.last) {
            let noop = this.current = this.last = this.chainNoop;
            return Promise.resolve(() => {
                if (noop) {
                    noop = undefined;
                    this.chainNext();
                }
            });
        }
        else {
            return new Promise((resolve) => {
                let lockChainFn = () => {
                    if (lockChainFn) {
                        this.current = lockChainFn;
                        lockChainFn = undefined;
                        resolve(this.chainNext);
                    }
                };
                this.last = this.last.next = lockChainFn;
            });
        }
    }
    lock(op) {
        return this.acquire().then(unlock => op().finally(unlock));
    }
}
exports.ReentrantLock = ReentrantLock;

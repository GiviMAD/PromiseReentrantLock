"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReentrantLock = void 0;
class ReentrantLock {
    constructor() {
        this.next = () => {
            if (this.current === this.last) {
                this.current = undefined;
                this.last = undefined;
            }
            else if (this.current && this.current.next) {
                this.current.next();
            }
        };
    }
    acquire() {
        if (!this.last) {
            /* c8 ignore next */
            this.current = this.last = () => null;
            return Promise.resolve(this.next);
        }
        else {
            return new Promise((resolve, reject) => {
                const lockChainItem = () => {
                    this.current = lockChainItem;
                    resolve(this.next);
                };
                this.last = this.last.next = lockChainItem;
            });
        }
    }
    lock(op) {
        return this.acquire().then(releaser => op().finally(releaser));
    }
}
exports.ReentrantLock = ReentrantLock;

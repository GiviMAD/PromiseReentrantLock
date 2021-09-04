"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReentrantLock = void 0;
var ReentrantLock = /** @class */ (function () {
    function ReentrantLock() {
        var _this = this;
        this.next = function () {
            if (_this.current === _this.last) {
                _this.current = undefined;
                _this.last = undefined;
            }
            else if (_this.current && _this.current.next) {
                _this.current.next();
            }
        };
    }
    ReentrantLock.prototype.acquire = function () {
        var _this = this;
        if (!this.last) {
            /* c8 ignore next */
            this.current = this.last = function () { return null; };
            return Promise.resolve(this.next);
        }
        else {
            return new Promise(function (resolve, reject) {
                var lockChainItem = function () {
                    _this.current = lockChainItem;
                    resolve(_this.next);
                };
                _this.last = _this.last.next = lockChainItem;
            });
        }
    };
    ReentrantLock.prototype.lock = function (op) {
        return this.acquire().then(function (releaser) { return op().finally(releaser); });
    };
    return ReentrantLock;
}());
exports.ReentrantLock = ReentrantLock;

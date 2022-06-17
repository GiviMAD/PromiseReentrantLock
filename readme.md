# ReentrantLock
## Lock mechanism for promises, using a linked list like implementation.
This module is intended to lock promises, forcing some code block to be executed complete before while other contexts wait for the lock to be released. 

The module has been written without using arrays using a linked function chain.

You can use same lock multiple times to lock different code blocks. 

It allows 2 semantics:
* Passing an async callback to the lock method
```js
const promiseLock = new ReentrantLock();
async function () {
    ...
    await promiseLock.lock(async ()=>{
        // your code block
    });   
    ...
}
```
* Adquire the lock (you need to release it always)
```js
const promiseLock = new ReentrantLock();
async function () {
    ...
    const releaseLockFn = await promiseLock.acquire();
    try{
        // your code block
    } finally {
        releaseLockFn();
    }
    ...
}
```
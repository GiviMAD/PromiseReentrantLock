# ReentrantLock

### Lightweight lock mechanism for promises, using a linked list implementation.

Lightweight, dependency free, promise lock mechanism.

It's implemented without relying on arrays using a linked function chain.

The implementation can be reviewed in a moment, it is under 50 lines.

## Examples:

The library can be used to avoid concurrent execution of an async block that contains await calls.

For example a token refresh http request than can be invoked from different promises.
The next example summarized how to reduce the possible overload caused by that common situation:

```js

const refreshLocker = new ReentrantLock();

let accessToken = "..."
let refreshToken = "..."

function isTokenExpired() {
    ... // return bool
}

async function refreshToken() {
    // We lock the refresh block execution
    await refreshLocker.lock(async ()=>{
        // By checking the state again after the lock was released we know the previous consumer has already refreshed the token 
        if(!isTokenExpired()) {
            // So we can abort the execution avoiding an unnecessary server call
            return;
        }
        let newCredentials = await fetch(...);
        ...
    });   
}

export async function myApiCall1() {
    if(isTokenExpired()) {
        await refreshToken();
    }
    ... // consume the api with a valid token
}


export async function myApiCall2() {
    if(isTokenExpired()) {
        await refreshToken();
    }
    ... // consume the api with a valid token
}

...
    // Somewhere in the code
    await Promise.all([myApiCall1(), myApiCall2()]);
...
```

Also can be used to chain async executions that are not awaited and need to be non concurrent.
For example to display messages in an UI one after another like in the next basic example:

```js
const tooltipLocker = new ReentrantLock();
function displayTextForAWhile(text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    tooltipLocker.lock((unlock) => {
        document.body.appendChild(elemDiv);
        setTimeout(() => {
            paragraph.remove();
            unlock();
        }, 2000);
    })
        .then(() => console.debug(`Text '${text}' displayed at ${new Date().getTime()}`))
        .catch((err) => ...);
}
displayTextForAWhile("One tip");
displayTextForAWhile("Other tip");
displayTextForAWhile("Another one");
```

# Semantic

The library allows two semantics:

Passing an async callback to the lock method:

```js
const promiseLocker = new ReentrantLock();
async function () {
    ...
    await promiseLocker.lock(async ()=>{
        // your code block
    });   
    ...
}
```

Acquire and release the lock:

```js
const promiseLocker = new ReentrantLock();
async function () {
    ...
    const unlockFn = await promiseLocker.acquire();
    try{
        // your code block
    } finally {
        // unlock next consumer
        unlockFn();
    }
    ...
}
```
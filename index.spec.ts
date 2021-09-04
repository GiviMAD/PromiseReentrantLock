import test from 'tape';
import { ReentrantLock } from '.';

test('should lock block code execution', async (t) => {
    let counter = 0;
    let executionsCount = 0;
    const concurrencyProblem = async () => {
        const _counter = counter;
        await new Promise(r => setTimeout(r, 0));
        counter = _counter + 1;
    };
    const concurrencyLock = new ReentrantLock();
    let promises: Promise<any>[] = [];
    for (let i = 0; i < 10; i++)
        promises.push(concurrencyLock.lock(() => concurrencyProblem()).then(() => executionsCount++));
    await Promise.all(promises);
    t.equal(executionsCount, 10, 'All executed');
    t.equal(counter, 10, 'Counter incremented correctly');
    t.end();
});
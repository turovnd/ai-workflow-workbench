import { setTimeout as wait } from 'node:timers/promises';
import { processJob } from './process';
import { pool, repository } from './runtime';

let stopping = false;
let nextCleanup = 0;
process.once('SIGTERM', () => {
  stopping = true;
});
process.once('SIGINT', () => {
  stopping = true;
});

try {
  while (!stopping) {
    if (Date.now() >= nextCleanup) {
      await repository.cleanup();
      nextCleanup = Date.now() + 60000;
    }
    if (!(await processJob(repository))) await wait(500);
  }
} finally {
  await pool.end();
}

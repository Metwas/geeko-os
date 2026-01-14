/**
     MIT License

     @Copyright (c) Metwas

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above Copyright notice and this permission notice shall be included in all
     copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR Copyright HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     SOFTWARE.
*/

/**_-_-_-_-_-_-_-_-_-_-_-_-_- Imports _-_-_-_-_-_-_-_-_-_-_-_-_-*/

const { performance } = require("node:perf_hooks");
const { ThreadPool } = require("../../dist/main");
const { LogService } = require("@geeko/log");
const { resolve } = require("node:path");

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

const pool = new ThreadPool(
       {
              file: resolve(__dirname, "./workers/sleep.js"),
              size: 2,
       },
       new LogService({
              level: "info",
       }),
);

const watchMode = process.argv.indexOf("--ws") > -1;
const length = 25;
let index = 0;

let promises = [];
let errors = 0;

const start = performance.now();

for (; index < length; ++index) {
       const promise = pool.queue(index);

       const response = function (data) {
              if (data.ok === false) {
                     errors = errors + 1;
                     console.error(`❌`, this.index);
              } else {
                     console.error(`✔️`, this.index);
              }
       }.bind({ index });

       promise.then(response);
       promises.push(promise);
}

const watch = (pool) => {
       setInterval(() => {
              console.log(
                     "Thread: " +
                            pool.size() +
                            " queue: " +
                            pool._queue.length +
                            " awaiting: " +
                            pool._resolvers.size,
              );
       }, 1000);
};

Promise.all(promises).then(() => {
       const end = performance.now();
       console.log(`OK [${(end - start).toFixed(3)} ms]`);

       if (!watchMode) {
              process.exit(1);
       }

       watch(pool);
});

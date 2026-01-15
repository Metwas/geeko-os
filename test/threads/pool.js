/**
 * Copyright (c) Metwas
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
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
              size: "auto",
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

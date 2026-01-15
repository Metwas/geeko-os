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

import { ThreadPoolOptions } from "../../types/ThreadPoolOptions";
import { Worker, WorkerOptions } from "node:worker_threads";
import { TrackedTask } from "../../types/TrackedTask";
import { Err, Ok, Result } from "../../types/Result";
import { PromiseToken } from "@geeko/tasks";
import { Thread } from "../../types/Thread";
import { LogService } from "@geeko/log";
import { cpus } from "node:os";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * @see Worker based thread pool interface
 *
 * @public
 */
export class ThreadPool {
       /**
        * @public
        * @param {ThreadPoolOptions} options
        * @param {LogService} logger
        */
       public constructor(options: ThreadPoolOptions, logger?: LogService) {
              this._persistent = options.persistent ?? true;
              this._auto = options.size === "auto";

              this._size = this._csize(options.size);
              this._max = options.maxQueueSize;
              this._file = options.file;

              this._logger = logger;
              this._init();
       }

       /**
        * Cleanup routine delay in ms
        *
        * @public
        * @type {Number}
        */
       public static readonly CLEAN_DELAY: number = 1000;

       /**
        * log provider
        *
        * @private
        * @type {LogService}
        */
       private _logger: LogService | undefined = void 0;

       /**
        * Thread pool count
        *
        * @private
        * @type {Number}
        */
       private _size: number;

       /**
        * Thread pool execution file path
        *
        * @private
        * @type {String}
        */
       private _file: string;

       /**
        * Max number of tasks in the queue backlog
        *
        * @private
        * @type {Number}
        */
       private _max: number;

       /**
        * Flag to ensure thread count is maintained if one or more @see Worker(s) shutdown
        *
        * @private
        * @type {Boolean}
        */
       private _persistent: boolean;

       /**
        * @see Worker construction options
        *
        * @private
        * @type {WorkerOptions}
        */
       private _wsoptions: WorkerOptions;

       /**
        * Map of active @see Promise based @see Result<any, Error> tasks awaiting processing by a given thread
        *
        * @private
        * @type {Map<number, PromiseToken<Result<any, Error>>>}
        */
       private _resolvers: Map<number, PromiseToken<Result<any, Error>>> =
              new Map();

       /**
        * Map of active @see Thread worker instances
        *
        * @private
        * @type {Map<number, Thread>}
        */
       private _threads: Map<number, Thread> = new Map();

       /**
        * Active task queue
        *
        * @private
        * @type {Array<TrackedTask<any>>}
        */
       private _queue: Array<TrackedTask<any>> = [];

       /**
        * Current @see Thread index used to round-robin each Thread to spread the workload
        *
        * @private
        * @type {Number}
        */
       private _cursor: number = 0;

       /**
        * Auto scale thread count flag
        *
        * @private
        * @type {Boolean}
        */
       private _auto: boolean = false;

       /**
        * Gets/Sets the thread pool count
        *
        * @public
        * @param {Number} size
        * @returns {Number}
        */
       public size(size?: number): number {
              if (typeof size === "number" && size > 0) {
                     this._size = size;
              }

              return this._size;
       }

       /**
        * Gets/Sets the thread pool execution file path
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       public file(path?: string): string {
              if (typeof path === "string") {
                     this._file = path;
              }

              return this._file;
       }

       /**
        * Gets/Sets the @see Worker construction options
        *
        * @public
        * @param {WorkerOptions} options
        * @returns {WorkerOptions}
        */
       public wsoptions(options?: WorkerOptions): WorkerOptions {
              if (options) {
                     this._wsoptions = options;
              }

              return this._wsoptions;
       }

       /**
        * Queues the given data to be processed on the configured @see Worker script file
        *
        * @public
        * @param {T} data
        * @returns {Promise<Result<T, Error>>}
        */
       public queue<T>(data?: T): Promise<Result<T, Error>> {
              if (
                     data === void 0 ||
                     data === null ||
                     (this._max > 0 && this._queue.length >= this._max)
              ) {
                     return void 0;
              }

              const token: PromiseToken<Result<T, Error>> = new PromiseToken<
                     Result<T, Error>
              >();

              this._queue.push({
                     data: data,
                     token: token,
              });

              this._next();
              return token.promise();
       }

       /**
        * Shuts down all @see Worker(s) and clears any queues
        *
        * @public
        */
       public shutdown(): void {
              while (this._queue.length > 0) {
                     const item: TrackedTask<any> | undefined =
                            this._queue.pop();

                     const token: PromiseToken<Result<any, Error>> =
                            item?.token;

                     if (!token) {
                            continue;
                     }

                     token.resolve(Err(new Error("ThreadPool shutting down")));
              }

              setImmediate(() => {
                     for (const thread of this._threads.values()) {
                            thread.worker.terminate();
                     }
              });
       }

       /**
        * Initializes the @see Worker threads
        *
        * @private
        */
       private _init(): void {
              const size: number = this._size;
              let index: number = 0;

              this._logger?.debug(`Initializing [${size}] threads`);

              for (; index < size; ++index) {
                     this._spawn(index);
              }
       }

       /**
        * Shifts the next task in the queue and targets the next idle @see Thread
        *
        * @private
        */
       private _next(): void {
              const queue: Array<any> = this._queue;

              if (queue.length === 0) {
                     return void 0;
              }

              const thread: Thread | undefined = this._thread();

              if (!thread) {
                     // no idle worker
                     return void 0;
              }

              const task: {
                     token: PromiseToken<Result<any, Error>>;
                     data: any;
              } = queue.shift();

              const id: number = this._cursor;

              thread.idle = false;
              this._resolvers.set(id, task.token);

              thread.worker.postMessage(task.data);
       }

       /**
        * Attempts to fetch the next idle @see Thread - returns null if checked (in x1 pass) all possible idle threads
        *
        * @private
        * @param {Number} start
        * @param {Number} loop
        * @returns {Thread | undefined}
        */
       private _thread(start?: number, loop?: number): Thread | undefined {
              this._cursor = this._cursor % this._size;

              const thread: Thread | undefined = this._threads.get(
                     this._cursor,
              );

              if (!thread || thread.idle === false) {
                     if (start === void 0) {
                            start = 0;
                     }

                     this._cursor = this._cursor + 1;

                     if (start >= this._size) {
                            if (this._auto) {
                                   return this._spawn(this._size++);
                            }

                            // already done a loop of all _threads
                            return void 0;
                     }

                     start = start + 1;
                     return this._thread(start);
              }

              return thread;
       }

       /**
        * Creates a new @see Worker thread from the give @see number index id
        *
        * @private
        * @param {Number} id
        * @returns {Thread}
        */
       private _spawn(id: number): Thread {
              const worker: Worker = new Worker(this._file, this._wsoptions);

              worker.on("message", this._message.bind(this, worker, id));

              worker.on("error", this._error.bind(this, worker, id));
              worker.once("exit", this._exit.bind(this, worker, id));

              const thread: Thread = {
                     worker: worker,
                     idle: true,
              };

              this._threads.set(id, thread);
              return thread;
       }

       /**
        * @see Worker message handler - resolves the @see PromiseToken
        *
        * @private
        * @param {Worker} worker
        * @param {Number} id
        * @param {Any} data
        */
       private _message(worker: Worker, id: number, data?: any): void {
              const thread: Thread = this._threads.get(id);
              thread.idle = true;

              const token: PromiseToken<Result<any, Error>> =
                     this._resolvers.get(id);

              if (token) {
                     token.resolve(Ok(data));
              }

              this._resolvers.delete(id);

              if (this._auto) {
                     thread.worker.terminate();
              }

              setImmediate(() => {
                     this._next();
              });
       }

       /**
        * @see Worker error handler - resolves the @see PromiseToken as an error @see Result
        *
        * @private
        * @param {Worker} worker
        * @param {Number} id
        * @param {Error} error
        */
       private _error(worker: Worker, id: number, error?: Error): void {
              const thread: Thread = this._threads.get(id);

              if (thread) {
                     const token: PromiseToken<any> = this._resolvers.get(id);
                     thread.idle = true;

                     if (token) {
                            token.resolve(Err(error));
                     }

                     this._logger?.error(
                            `Worker [${id}::${worker.threadId}] Error [${error?.message ?? "Unknown"}}]`,
                     );
              }
       }

       /**
        * @see Worker exit handler - resolves the @see PromiseToken as an error @see Result and attempts to re-spawn worker if persistent has been set
        *
        * @private
        * @param {Worker} worker
        * @param {Number} id
        * @param {Number} code
        */
       private _exit(worker: Worker, id: number, code?: number): void {
              this._logger?.debug(`Worker [${id}::${worker.threadId}] Exited`);

              const token: PromiseToken<Result<any, Error>> =
                     this._resolvers.get(id);

              if (token) {
                     token.resolve(
                            Err(
                                   new Error(
                                          `Worker [${id}::${worker.threadId}] exited, code [${code ?? "Unknown"}]`,
                                   ),
                            ),
                     );
              }

              worker.removeAllListeners();

              this._resolvers.delete(id);
              this._threads.delete(id);

              /** Close and adjust size if set to auto */
              if (this._auto && this._size > 1) {
                     this._size = this._size - 1;
                     return void 0;
              }

              if (
                     this._persistent === true &&
                     this._threads.size < this._size
              ) {
                     this._spawn(id);
              }
       }

       /**
        * Calculate thread count based on the @see ThreadPoolOptions
        *
        * @private
        * @param {Number} size
        * @returns {Number}
        */
       private _csize(size?: number | string): number {
              return this._auto
                     ? cpus().length / 2
                     : typeof size === "number"
                       ? size
                       : cpus().length / 2;
       }
}

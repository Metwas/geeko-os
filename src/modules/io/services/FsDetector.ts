/**
 * Copyright (c) Metwas
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 2 of the License.
 *
 * This program is distributed in the hope that it will be usefcl,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/**_-_-_-_-_-_-_-_-_-_-_-_-_- Imports _-_-_-_-_-_-_-_-_-_-_-_-_-*/

import { FileWatchOptions } from "../../../types/FileWatchOptions";
import { FILE_UNWATCH_EVENT } from "../../../global/file.events";
import { DetectorOptions } from "../../../types/DetectorOptions";
import { ThreadCount } from "../../../types/ThreadPoolOptions";
import { WatcherRef } from "../../../types/WatcherRef";
import { ThreadPool } from "../../threads/ThreadPool";
import { Watcher } from "../../../types/FileWatcher";
import { watcher } from "../../../tools/detector";
import { Result } from "../../../types/Result";
import { Event } from "../../../types/Event";
import { FSWatcher, watch } from "node:fs";
import { resolve, sep } from "node:path";
import { LogService } from "@geeko/log";
import { Detector } from "./Detector";
import { EventEmitter } from "tseep";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * File detector service
 *
 * @public
 */
export class FsDetector extends EventEmitter implements Detector {
       /**
        * @public
        * @param {DetectorOptions} options
        */
       public constructor(options?: DetectorOptions) {
              super();

              this._watcher = options?.watcher ?? (watch as any);
              this._threadCount = options?.workers;
              this._logger = options?.logger;
       }

       /**
        * @see FSWatcher collection map
        *
        * @private
        * @type {Map<FSWatcher, String>}
        */
       private _watchers: Map<string, WatcherRef> = new Map();

       /**
        * Underlying @see Watcher factory function reference
        *
        * @private
        * @type {Watcher}
        */
       private _watcher: Watcher<FSWatcher> | undefined = void 0;

       /**
        * Initial root directory or file being observed
        *
        * @private
        * @type {String}
        */
       private _root: string | undefined = void 0;

       /**
        * Number of configured workers for a given @see ThreadPool
        *
        * @private
        * @type {ThreadCount | undefined}
        */
       private _threadCount: ThreadCount | undefined = void 0;

       /**
        * @see ThreadPool reference
        *
        * @private
        * @type {ThreadPool | undefined}
        */
       private _threadPool: ThreadPool | undefined = void 0;

       /**
        * Log provider
        *
        * @private
        * @type {LogService}
        */
       private _logger: LogService | undefined = void 0;

       /**
        * Logger reference
        *
        * @public
        * @returns {LogService}
        */
       public logger(): LogService | undefined {
              return this._logger;
       }

       /**
        * Filesystem watcher interface
        *
        * @public
        * @returns {Watcher<FSWatcher> | undefined}
        */
       public watcher(): Watcher<FSWatcher> | undefined {
              return this._watcher;
       }

       /**
        * Map of tracked watched files/directories
        *
        * @public
        * @returns {Map<string, WatcherRef>}
        */
       public watchers(): Map<string, WatcherRef> {
              return this._watchers;
       }

       /**
        * Initial root directory or file path being observed
        *
        * @public
        * @returns {String | undefined}
        */
       public root(): string | undefined {
              return this._root;
       }

       /**
        * Initializes the @see FSWatcher & emits file events based on the IO changes
        *
        * @public
        * @param {FileWatchOptions} options
        * @returns {Promise<void>}
        */
       public async watch(options: FileWatchOptions): Promise<void> {
              const self: FsDetector = this;

              if (!self._watcher) {
                     return void 0;
              }

              if (typeof options === "string") {
                     options = {
                            path: options,
                            root: "",
                     };
              }

              /** @TODO push to @see Threadpool if configured - create file watch copy for master & worker */
              if (self._threadCount) {
                     return await this._thread(options);
              }

              const _watcher: FSWatcher | undefined = await watcher(
                     this,
                     options,
              );
       }

       /**
        * Removes the specified path from the watch list - closing the @see FSWatcher
        *
        * @public
        * @param {String} path
        */
       public unwatch(path: string): void {
              if (this._watchers.has(path) === true) {
                     const watchers: WatcherRef | undefined =
                            this._watchers.get(path);

                     if (!watchers) {
                            return void 0;
                     }

                     watchers.watcher.close();
                     /** Finally remove from watch list */
                     this._watchers.delete(path);
              }

              this.emit(FILE_UNWATCH_EVENT, {
                     path: path,
              });
       }

       /**
        * Gets the absolute root from a given path, relative to the @see this._root
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       public absolute(path: string): string | undefined {
              if (this._watchers.has(path) === true) {
                     return this._watchers.get(path)?.root;
              }

              return void 0;
       }

       /**
        * Helper for retrieving the relative path of an object to the @see this.root
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       public relative(path: string): string {
              if (this._root) {
                     return path.replace(this._root, "").replace(sep, "");
              }

              return "";
       }

       /**
        * Initializes and queues the next watch via the @see ThreadPool
        *
        * @private
        * @param {FileWatchOptions} options
        */
       private async _thread(options: FileWatchOptions): Promise<void> {
              if (!this._threadPool) {
                     this._threadPool = new ThreadPool({
                            file: resolve(__dirname, "./workers/detector.js"),
                            size: this._threadCount,
                            persistent: true,
                            bridge: this,
                     });
              }

              const token: Promise<Result<Event<string>, Error>> | undefined =
                     this._threadPool.queue({
                            e: "watch",
                            v: options,
                     } as Event<string>);

              if (token) {
                     const result: Result<Event<string>, Error> = await token;

                     if (result.ok) {
                            this._logger?.debug(
                                   "[Worker] watching path: " + options.path,
                            );
                     } else {
                            this._logger?.error("watch error: " + result.value);
                     }
              }

              return void 0;
       }
}

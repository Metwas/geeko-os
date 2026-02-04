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

import { FileWatchOptions } from "../../../../types/FileWatchOptions";
import { FILE_UNWATCH_EVENT } from "../../../../global/file.events";
import { DetectorOptions } from "../../../../types/DetectorOptions";
import { Detector } from "../../../../modules/io/services/Detector";
import { WatcherRef } from "../../../../types/WatcherRef";
import { Watcher } from "../../../../types/FileWatcher";
import { watcher } from "../../../../tools/detector";
import { parentPort } from "node:worker_threads";
import { FSWatcher, watch } from "node:fs";
import { DefaultEventMap } from "tseep";
import { LogService } from "@geeko/log";
import { sep } from "node:path";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * IPC event-based file detector interface
 *
 * @public
 */
export class ThreadedDetector implements Detector {
       /**
        * @public
        * @param {DetectorOptions} options
        */
       public constructor(options?: DetectorOptions) {
              this._watcher = options?.watcher ?? (watch as any);
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
        * Initializes the @see FSWatcher & emits file events based on the IO changes
        *
        * @public
        * @param {FileWatchOptions} options
        * @returns {Promise<void>}
        */
       public async watch(options: FileWatchOptions): Promise<void> {
              if (!this._watcher) {
                     return void 0;
              }

              if (typeof options === "string") {
                     options = {
                            path: options,
                            root: "",
                     };
              }

              const _watcher: FSWatcher | undefined = await watcher(
                     this,
                     options,
              );

              if (_watcher) {
                     parentPort?.postMessage({
                            ok: true,
                     });
              }
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
        * @public
        * @param {EventKey} event
        * @param {Parameters<DefaultEventMap[EventKey]>} args
        * @returns {Boolean}
        */
       public emit<EventKey extends string>(
              event: EventKey,
              ...args: Parameters<DefaultEventMap[EventKey]>
       ): boolean {
              return (
                     parentPort?.postMessage({
                            e: event,
                            v: args,
                     }) || false
              );
       }

       /**
        * @public
        * @param {EventKey} event
        * @param {DefaultEventMap[EventKey]} listener
        * @returns {Detector}
        */
       public on<EventKey extends string>(
              event: EventKey,
              listener: DefaultEventMap[EventKey],
       ): this {
              if (parentPort) {
                     parentPort.on(event, listener);
              }

              return this;
       }

       /**
        * @public
        * @param {EventKey} event
        * @param {DefaultEventMap[EventKey]} listener
        * @returns {Detector}
        */
       public once<EventKey extends string>(
              event: EventKey,
              listener: DefaultEventMap[EventKey],
       ): this {
              if (parentPort) {
                     parentPort.once(event, listener);
              }

              return this;
       }
}

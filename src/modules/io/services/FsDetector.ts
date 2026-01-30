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

import { FILE_UNWATCH_EVENT } from "../../../global/file.events";

import { FileWatchOptions } from "../../../types/FileWatchOptions";
import { DetectorOptions } from "../../../types/DetectorOptions";
import { createWatcher } from "../../../tools/detector";
import { WatcherRef } from "../../../types/WatcherRef";
import { Watcher } from "../../../types/FileWatcher";
import { FSWatcher, watch } from "node:fs";
import { LogService } from "@geeko/log";
import { Detector } from "./Detector";
import { EventEmitter } from "tseep";
import { sep } from "node:path";

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
              const watcher: FSWatcher | undefined = await createWatcher(
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
        * Checks if the provided @see String path is the initial observed root path
        *
        * @protected
        * @param {String} path
        * @returns {Boolean}
        */
       protected isRoot(root: string, path: string): boolean {
              return root === path;
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
}

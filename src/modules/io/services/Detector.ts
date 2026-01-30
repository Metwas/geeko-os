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

import { FileWatchOptions } from "../../../types/FileWatchOptions";
import { WatcherRef } from "../../../types/WatcherRef";
import { Watcher } from "../../../types/FileWatcher";
import { LogService } from "@geeko/log";
import { IEventEmitter } from "tseep";
import { FSWatcher } from "node:fs";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * File/Directory detector interface
 *
 * @public
 */
export interface Detector extends IEventEmitter {
       /**
        * Initial root directory or file path being observed
        *
        * @public
        * @returns {String}
        */
       root(): string | undefined;

       /**
        * Helper for retrieving the relative path of an object to the @see this.root
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       relative(path: string): string;

       /**
        * Logger reference
        *
        * @public
        * @returns {LogService}
        */
       logger(): LogService | undefined;

       /**
        * Filesystem watcher interface
        *
        * @public
        * @returns {Watcher<FSWatcher> | undefined}
        */
       watcher(): Watcher<FSWatcher> | undefined;

       /**
        * Map of tracked watched files/directories
        *
        * @public
        * @returns {Map<string, WatcherRef>}
        */
       watchers(): Map<string, WatcherRef>;

       /**
        * Gets the absolute root from a given path, relative to the @see this._root
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       absolute(path: string): string | undefined;

       /**
        * Initializes the @see FSWatcher & emits file events based on the IO changes
        *
        * @public
        * @param {FileWatchOptions} options
        * @returns {Promise<void>}
        */
       watch(options: FileWatchOptions): Promise<void>;

       /**
        * Removes the specified path from the watch list - closing the @see FSWatcher
        *
        * @public
        * @param {String} path
        */
       unwatch(path: string): void;
}

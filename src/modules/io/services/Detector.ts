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

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * File/Directory detector interface
 *
 * @public
 */
export interface Detector {
       root(): string;
       event(name: string, data: any): void;

       /**
        * Helper for retrieving the relative path of an object to the @see this.root
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       relative(path: string): string;

       /**
        * Gets the absolute root from a given path, relative to the @see this._root
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       absolute(path: string): string;

       /**
        * Initializes the @see FSWatcher & emits file events based on the IO changes
        *
        * @public
        * @param {FileWatchOptions} options
        * @returns {Promise<void>}
        */
       watch(options: FileWatchOptions): Promise<void>;3

       /**
        * Removes the specified path from the watch list - closing the @see FSWatcher
        *
        * @public
        * @param {String} path
        */
       unwatch(path: string): void;
}

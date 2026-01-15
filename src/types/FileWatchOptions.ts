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

import { WatchOptions } from "node:fs";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * @see FsDetector watch options
 *
 * @public
 */
export interface FileWatchOptions extends WatchOptions {
       /**
        * Relative or absolute file or directory path
        *
        * @public
        * @type {String}
        */
       path: string;

       /**
        * Root path, usually same as @see path
        *
        * @public
        * @type {String}
        */
       root?: string;

       /**
        * Directory branch level count
        *
        * @public
        * @type {Number}
        */
       level?: number;
}

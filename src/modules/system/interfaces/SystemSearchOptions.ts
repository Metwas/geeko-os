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

import { SystemProcessOperation } from "./SystemProcessOperation";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Common search scopes
 *
 * @public
 * @type {String}
 */
export type SearchScope =
       | "file"
       | "executable"
       | "env"
       | "directory"
       | "application"
       | "any";

/**
 * System search options interface
 *
 * @public
 */
export interface SystemSearchOptions extends SystemProcessOperation {
       /**
        * Search term
        *
        * @public
        * @type {Array<String> | String}
        */
       name?: string | Array<string>;

       /**
        * Search focus or scope @see SearchScope
        *
        * @public
        * @type {SearchScope}
        */
       scope?: SearchScope;

       /**
        * Search root directory
        *
        * @public
        * @type {String}
        */
       directory?: string;

       /**
        * File extension to match search
        *
        * @public
        * @type {String}
        */
       extension?: string;
}

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

import { SystemModule } from "../../types/SystemModule";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * NPM package installation module interface
 *
 * @public
 */
export interface NpmModule extends SystemModule {
       /**
        * Install as development dependancy
        *
        * @public
        * @type {Boolean}
        */
       development?: boolean;

       /**
        * Option to download the .tar NPM package rather than the default 'npm install' to the given path
        *
        * @public
        * @type {String}
        */
       tarPath?: string;

       /**
        * Install as global dependancy
        *
        * @public
        * @type {Boolean}
        */
       global?: boolean;
}

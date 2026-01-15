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

import { ApplicationPlatformMap } from "./ApplicationPlatformMap";
import { ApplicationName } from "./ApplicationName";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * System process launch interface
 *
 * @public
 */
export interface ProcessLaunchOptions {
       /**
        * Launch arguments
        *
        * @public
        * @type {Array<String>}
        */
       flags?: Array<string>;

       /**
        * Clears the cached location reference for the specified application
        *
        * @public
        * @type {Boolean}
        */
       clearCache?: boolean;

       /**
        * Shell execution path, e.g /bin/bash /bin/node or node
        *
        * @public
        * @type {String}
        */
       shell?: string;

       /**
        * Optional directory specification for the given @see app
        *
        * @public
        * @type {String}
        */
       directory?: string;

       /**
        * Full executable path to the application instance/file
        *
        * @public
        * @type {String}
        */
       executablePath?: string;

       /**
        * Option to restart the application on exit
        *
        * @public
        * @type {Boolean}
        */
       restartOnExit?: boolean;

       /**
        * Flag to indicate only one instance can be running at a time
        *
        * @public
        * @type {Boolean}
        */
       exclusive?: boolean;

       /**
        * Flag to run the executable on a seperate process channel
        *
        * @public
        * @type {Boolean}
        */
       detached?: boolean;

       /**
        * Optional environments variables to be provided on launch
        *
        * @public
        * @type {String}
        */
       env?: string;
}

/**
 * Application launch options
 *
 * @public
 */
export interface ApplicationLaunchOptions extends ProcessLaunchOptions {
       /**
        * Application identification
        *
        * @public
        * @type {ApplicationName | ApplicationPlatformMap}
        */
       app: ApplicationName | ApplicationPlatformMap;
}

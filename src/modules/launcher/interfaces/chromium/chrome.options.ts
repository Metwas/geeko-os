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

import { ApplicationLaunchOptions } from "../../../../types/ApplicationLaunchOptions";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Chromium launch options
 *
 * @public
 */
export interface ChromeOptions extends ApplicationLaunchOptions {
       /**
        * Application or Web URL
        *
        * @public
        * @type {String}
        */
       url?: string;

       /**
        * Debugger port
        *
        * @public
        * @type {Number}
        */
       port?: number;

       /**
        * Debugging port to open, disabled if not specified
        *
        * @public
        * @type {Number}
        */
       debugPort?: number;

       /**
        * User profile directory path
        *
        * @public
        * @type {String}
        */
       profileDirectory?: string;

       /**
        * Initializes the chromium instance in a kiosk fullscreen/tablet mode
        *
        * @public
        * @type {Boolean}
        */
       kiosk?: boolean;
}

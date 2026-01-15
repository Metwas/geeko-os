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

import { ApplicationPlatformMap } from "../../../types/ApplicationPlatformMap";
import { Platform } from "../../../types/Platform";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Default platform name, defaults to 'linux'
 *
 * @public
 * @type {String}
 */
export const DEFAULT_PLATFORM_NAME: Platform = "linux";

/**
 * Creates a default platform @see DEFAULT_PLATFORM_NAME map
 *
 * @public
 * @param {String} name
 * @returns {ApplicationPlatformMap}
 */
export const createDefaultPlatformMap = (
       name: string,
): ApplicationPlatformMap => {
       const applicationObject: any = {};
       const platformObject: any = {};

       platformObject[DEFAULT_PLATFORM_NAME] = name;
       applicationObject[name] = platformObject;

       return applicationObject;
};

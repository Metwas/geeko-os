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

import { ApplicationResolverOptions } from "../../../../types/ApplicationResolverOptions";
import { DEFAULT_PLATFORM_NAME } from "../../tools/platform";
import { Platform } from "../../../../types/Platform";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Cross-platform application resolver class
 *
 * @public
 */
export class ApplicationPathResolver {
       /**
        * Resolves the specified application @see String name from the given @see ApplicationResolverOptions
        *
        * @public
        * @param {Object} map
        * @param {ApplicationResolverOptions} options
        * @returns {String}
        */
       public static resolveFor(
              map: any,
              options: ApplicationResolverOptions,
       ): string {
              const platformName: Platform =
                     options?.["platform"] ?? DEFAULT_PLATFORM_NAME;
              /** get platform specific path for the given application @see string name */
              return map[platformName];
       }
}

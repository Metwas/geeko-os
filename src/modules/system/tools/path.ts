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

import { basename, isAbsolute, resolve } from "node:path";
import { existsSync } from "node:fs";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Validates if the provided path is a valid system navigational path
 *
 * @public
 * @param {String} path
 * @returns {Boolean}
 */
export const isPath = (path: string): boolean => {
       if (typeof path !== "string") {
              return false;
       }

       return path.indexOf("/") > -1 || path.indexOf("\\") > -1;
};

/**
 * Systems path resolve helper
 *
 * @public
 * @param {String} path
 * @returns {String}
 */
export const resolvePath = (
       path: string,
       quoteOnlySpaces: boolean = false,
): string => {
       if (isPath(path) === false) {
              return path;
       }

       const resolvedPath: string = isAbsolute(path)
              ? path
              : resolve(__dirname, path);
       // wrap in quotes if set
       return quoteOnlySpaces ? resolveSpacedPath(resolvedPath) : resolvedPath;
};

/**
 * Resolves any spaces within the provided path by wrapping "" (Windows)
 *
 * @public
 * @param {String} path
 * @returns {String}
 */
export const resolveSpacedPath = (path: string): string => {
       let local: string = path;

       let spaceRegex: RegExp = /[\(\)a-zA-Z0-9_]+( [\(\)a-zA-Z0-9_]+)+/g;

       const spaces: Array<string> | null = local.match(spaceRegex);
       const length: number = Array.isArray(spaces) ? spaces.length : 0;
       let index: number = 0;

       for (; index < length; index++) {
              const space: string | undefined = spaces?.[index];

              if (!space) {
                     continue;
              }

              // add quotes around the space directory
              local = local.replace(space, `"${space}"`);
       }

       return local;
};

/**
 * Attempts to extract the filename from the given file path
 *
 * @public
 * @param {String} path
 * @returns {String}
 */
export const getFileNameFromPath = (path: string): string => {
       if (typeof path === "string" && existsSync(path)) {
              return basename(path);
       }

       return "";
};

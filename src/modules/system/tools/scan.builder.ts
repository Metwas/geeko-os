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

import {
       SystemSearchOptions,
       SearchScope,
} from "../interfaces/SystemSearchOptions";

import { WINDOWS_DEFAULT_ROOT } from "../constants/windows.constants";
import { LINUX_DEFAULT_ROOT } from "../constants/linux.constants";
import { Stats, constants, statSync } from "node:fs";
import { IOSProvider } from "../interfaces/os";
import { CollectionMap } from "@geeko/core";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Builds an array of executable flags ready for the Windows search command
 * @see WINDOWS_OBJECT_SCAN_COMMAND
 *
 * @public
 * @param {IOSProvider} provider
 * @param {Array<string>} files
 * @param {SystemSearchOptions} options
 * @returns {Array<string>}
 */
export const buildWindowsSearchOptions = (
       provider: IOSProvider,
       files: Array<string | undefined>,
       options?: SystemSearchOptions,
): Array<string> => {
       let search: Array<string> = [];
       options = options || {};

       let scope: SearchScope = options["scope"] || "any";
       let extension: string = options["extension"] || "";
       let directory: string = provider.resolvePath(
              options["directory"] || WINDOWS_DEFAULT_ROOT,
              false,
       );

       // remove final directory "/" if set
       if (directory && directory[directory.length - 1] === "\\") {
              directory = directory.substring(0, directory.length - 1);
       }

       search.push(
              `/R "${directory}"  ${mapFileExtensions(files, extension).join(" ")}`,
       );

       return search;
};

/**
 * Builds an array of executable flags ready for the Linux search command
 * @see LINUX_OBJECT_SCAN_COMMAND
 *
 * @public
 * @param {IOSProvider} provider
 * @param {Array<string>} files
 * @param {SystemSearchOptions} options
 * @returns {Array<string>}
 */
export const buildLinuxSearchOptions = (
       provider: IOSProvider,
       files: Array<string | undefined>,
       options?: SystemSearchOptions,
): Array<string> => {
       let search: Array<string> = [];
       options = options || {};

       let scope: SearchScope = options["scope"] || "any";
       let extension: string = options["extension"] || "";
       let directory: string = provider.resolvePath(
              options["directory"] || LINUX_DEFAULT_ROOT,
       );

       switch (scope) {
              case "executable":
                     search.push(
                            `${directory} -name ${mapFileExtensions(files, extension || "exe").join(" ")}`,
                     );
                     break;
              case "application":
                     search.push(`${mapFileExtensions(files, "").join(" ")}`);
                     break;
              case "file":
              case "any":
              default:
                     search.push(
                            `${directory} -name  ${mapFileExtensions(files, extension || "*").join(" ")}`,
                     );
                     break;
       }

       return search;
};

/**
 * Helper for mapping a collection of file names with a specified extension
 *
 * @public
 * @param {Array<String>} files
 * @param {String} extension
 * @returns {Array<String>}
 */
export const mapFileExtensions = (
       files: Array<string | undefined>,
       extension: string,
): Array<string> => {
       const length: number = Array.isArray(files) ? files.length : 0;
       let index: number = 0;

       extension = extension.replace(".", "");

       let mapped: Array<string> = [];

       for (; index < length; index++) {
              const file: string | undefined = files[index];

              if (!file) {
                     continue;
              }

              mapped.push(
                     `${files[index] || "*"}${extension ? "." + extension : ""}`,
              );
       }

       return mapped;
};

/**
 * Common system executable @see RegExp
 *
 * @private
 * @type {RegExp}
 */
const EXEC_REGEX: RegExp = /\.(exe|bat|cmd|com|ps1|sh|bin|run|appimage)$/i;

/**
 * Checks if the specified path is an system executable file
 *
 * @public
 * @param {String} path
 * @returns {Boolean}
 */
export const isExecutable = (path: string): boolean => {
       try {
              const match: Array<any> | null = path.match(EXEC_REGEX);

              if (!Array.isArray(match) || !match[0]) {
                     const stats: Stats = statSync(path);
                     /** Check if file is executable if no extension was detected */
                     if (
                            stats.isFile() &&
                            (stats.mode &
                                   (constants.S_IXUSR |
                                          constants.S_IXGRP |
                                          constants.S_IXOTH)) !==
                                   0
                     ) {
                            return true;
                     }
              }

              return false;
       } catch (error) {
              return false;
       }
};

/**
 * Validates the provided line based on the file @see SearchScope
 *
 * @private
 * @param {String} line
 * @param {SearchScope} scope
 * @returns {Boolean}
 */
const isValidPath = (line: string, scope?: SearchScope): boolean => {
       if (typeof line !== "string" || line.indexOf(":") > -1) {
              return false;
       }

       if (scope === "application") {
              return isExecutable(line);
       }

       return true;
};

/**
 * Gets the associated file key based on the given line
 *
 * @private
 * @param {String} line
 * @param {Array<String>} keys
 * @returns {String}
 */
const getOccociatedFile = (
       line: string,
       keys: Array<string | undefined> | undefined,
): string | undefined => {
       if (Array.isArray(keys) === false) {
              return void 0;
       }

       const length: number = keys.length;
       let index: number = 0;

       for (; index < length; index++) {
              const key: string | undefined = keys[index];

              if (key && line.indexOf(key) > -1) {
                     return key;
              }
       }

       return void 0;
};

/**
 * Builds the search response for the filtered object outputs
 *
 * @public
 * @param {Array<String>} output
 * @param {Object} input
 * @returns {ObjectSearchResponse}
 */
export const buildSearchResponse = (
       output: Array<string>,
       input: {
              keys: Array<string | undefined> | undefined;
              options: SystemSearchOptions | undefined;
       },
): CollectionMap<string> => {
       output = Array.isArray(output) ? output : [output];
       const length: number = output.length;
       let index: number = 0;

       let scope: SearchScope | undefined = input?.options?.scope;
       let results: CollectionMap<string> = {};

       for (; index < length; index++) {
              const line: string = output[index];
              const valid: boolean = isValidPath(line, scope);

              if (valid) {
                     const file: string =
                            getOccociatedFile(line, input?.keys) || "stdout";

                     if (typeof file === "string") {
                            results[file] = results[file] || [];
                            results[file].push(cleanPath(line));
                     }
              }
       }

       return results;
};

/**
 * File path cleaner function
 *
 * @public
 * @param {String} value
 * @returns {String}
 */
export const cleanPath = (value: string): string => {
       value = value.split("\r\n").join("");
       return value.split("\\").join("/");
};

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

import { buildWindowsSearchOptions, buildSearchResponse } from "./scan.builder";
import { WINDOWS_OBJECT_SCAN_COMMAND } from "../constants/windows.constants";
import { SystemSearchOptions } from "../interfaces/SystemSearchOptions";
import { splitNewline } from "../../../tools/text.utilities";
import { ChildProcess, exec } from "node:child_process";
import { IOSProvider } from "../interfaces/os";
import { CollectionMap } from "@geeko/core";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Using the default 'where' command, this searches the current system for the specified file, executable or variable depending on the provided scope
 *
 * @public
 * @param {IOSProvider} provider
 * @param {String} searchTerm
 * @param {SystemSearchOptions} options
 * @returns {Promise<Array<string>>}
 */
export const whereIs = (
       provider: IOSProvider,
       options: SystemSearchOptions,
): Promise<CollectionMap<string>> => {
       return new Promise<CollectionMap<string>>((resolve, reject) => {
              let search: Array<string> = Array.isArray(options?.["name"])
                     ? options["name"]
                     : [options?.["name"]];
              const flags: Array<string> = buildWindowsSearchOptions(
                     provider,
                     search,
                     options,
              );

              const childProcess: ChildProcess = exec(
                     `${WINDOWS_OBJECT_SCAN_COMMAND} ${flags.join(" ")}`,
                     (error: Error, stdout: string, stderr: string) => {
                            if (error || stderr) {
                                   resolve(null);
                            } else {
                                   resolve(
                                          buildSearchResponse(
                                                 splitNewline(stdout),
                                                 {
                                                        keys: search,
                                                        options: options,
                                                 },
                                          ),
                                   );
                            }
                     },
              );

              // setup abort listener
              if (options.abort) {
                     options["abort"].signal.onabort = function () {
                            // pass process for the system os to handle the termination properly
                            provider.kill(childProcess);
                     };
              }
       });
};

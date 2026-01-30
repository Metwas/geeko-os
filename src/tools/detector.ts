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
       FILE_CHANGE_EVENT,
       FILE_CREATE_EVENT,
       FILE_DELETE_EVENT,
} from "../global/file.events";

import { stat, readdir, FileHandle, open } from "node:fs/promises";
import { Detector } from "../modules/io/services/Detector";
import { FileWatchOptions, Watcher } from "../types";
import { WatcherRef } from "../types/WatcherRef";
import { extension, filename } from "./io";
import { FSWatcher, Stats } from "node:fs";
import { LogService } from "@geeko/log";
import { sep } from "node:path";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Initializes the @see Detector.watch given the @see FileWatchOptions
 *
 * @public
 * @param {Detector} detector
 * @param {FileWatchOptions} options
 * @returns {Promise<FSWatcher | undefined>}
 */
export const createWatcher = async (
       detector: Detector,
       options: FileWatchOptions,
): Promise<FSWatcher | undefined> => {
       const self: Detector = detector;
       const watcher: Watcher<FSWatcher> | undefined = self.watcher();
       const watchers: Map<string, WatcherRef> = self.watchers();
       const logger: LogService | undefined = self.logger();

       if (!watcher) {
              logger?.error("Invalid fs watcher interface was provided");
              return void 0;
       }

       const recursive: boolean = options?.recursive === false ? false : true;
       const fileOrDirectory: string = options?.path;

       const stats: Stats = await stat(fileOrDirectory);
       const level: number = options.level ?? 0;

       let root: string | undefined = options.root;

       if (stats.isDirectory()) {
              root = root ?? fileOrDirectory;

              /** Watch each individual file changes if specified - @see recursive */
              const files: Array<string> = (await readdir(fileOrDirectory, {
                     recursive,
              })) as Array<string>;

              const length: number = files.length;
              let index: number = 0;

              for (; index < length; ++index) {
                     try {
                            const fileName: string = `${fileOrDirectory}${sep}${files[index]}`;
                            const istats: Stats = await stat(fileName);

                            const isFile = istats.isFile();

                            /** Skip if @see recursive & not of root if placed in another directory */
                            if (
                                   isFile ||
                                   (root === fileName && recursive === false)
                            ) {
                                   continue;
                            }

                            self.watch({
                                   recursive: recursive,
                                   level: level + 1,
                                   path: fileName,
                                   root: fileName,
                            });
                     } catch (error) {
                            logger?.error(
                                   typeof error === "string"
                                          ? error
                                          : (error as any)?.message,
                            );
                     }
              }
       }

       let lastChange: number | undefined = void 0;

       const type: string = stats.isFile()
              ? "file"
              : stats.isDirectory()
                ? "directory"
                : "";

       self.emit(FILE_CREATE_EVENT, {
              name: filename(fileOrDirectory),
              path: fileOrDirectory,
              size: stats.size,
              level: level,
              type: type,
              root: root,
       });

       const _watcher: FSWatcher = watcher(
              fileOrDirectory,
              async (eventType: string, fileName: string): Promise<void> => {
                     try {
                            const fullName: string = `${fileOrDirectory}/${fileName}`;
                            const canRead: FileHandle = await open(
                                   fullName,
                                   "r",
                            );

                            if (canRead) {
                                   const stats: Stats | undefined =
                                          await stat(fullName);

                                   if (!stats) {
                                          return void 0;
                                   }

                                   if (stats.isFile()) {
                                          const modifiedAt: number =
                                                 stats.mtime.getTime();
                                          /** Check if file has been modified */
                                          if (
                                                 lastChange === void 0 ||
                                                 modifiedAt > lastChange
                                          ) {
                                                 self.emit(FILE_CHANGE_EVENT, {
                                                        root: self.absolute(
                                                               fullName,
                                                        ),
                                                        extension: extension(
                                                               fullName,
                                                        ),
                                                        name: filename(
                                                               fullName,
                                                        ),
                                                        size: stats.size,
                                                        path: fullName,
                                                        level: level,
                                                        type: "file",
                                                 });
                                          }

                                          lastChange = modifiedAt;
                                   } else if (stats.isDirectory()) {
                                          root = self.absolute(fullName);

                                          /** Assume directory is new */
                                          if (
                                                 watchers.has(fullName) ===
                                                 false
                                          ) {
                                                 self.emit(FILE_CREATE_EVENT, {
                                                        name: filename(
                                                               fullName,
                                                        ),
                                                        type: "directory",
                                                        size: stats.size,
                                                        path: fullName,
                                                        level: level,
                                                        root: root,
                                                 });
                                          }

                                          /** Otherwise check for any newly added files if @see recursive is set  */
                                          if (recursive === true) {
                                                 const files: Array<string> =
                                                        (await readdir(
                                                               fullName,
                                                               {
                                                                      recursive,
                                                               },
                                                        )) as Array<string>;

                                                 const length: number =
                                                        files.length;
                                                 let index: number = 0;

                                                 for (
                                                        ;
                                                        index < length;
                                                        ++index
                                                 ) {
                                                        try {
                                                               const file: string = `${fullName}${sep}${files[index]}`;
                                                               /** Add to watch list if not already added */
                                                               if (
                                                                      watchers.has(
                                                                             file,
                                                                      ) ===
                                                                      false
                                                               ) {
                                                                      const stats: Stats =
                                                                             await stat(
                                                                                    file,
                                                                             );

                                                                      if (
                                                                             stats.isDirectory()
                                                                      ) {
                                                                             self.watch(
                                                                                    {
                                                                                           recursive: recursive,
                                                                                           root: root,
                                                                                           path: file,
                                                                                    },
                                                                             );
                                                                      }

                                                                      self.emit(
                                                                             FILE_CREATE_EVENT,
                                                                             {
                                                                                    type: stats.isDirectory()
                                                                                           ? "directory"
                                                                                           : "file",
                                                                                    extension: extension(
                                                                                           file,
                                                                                    ),
                                                                                    name: filename(
                                                                                           file,
                                                                                    ),
                                                                                    size: stats.size,
                                                                                    level: level,
                                                                                    path: file,
                                                                                    root: root,
                                                                             },
                                                                      );
                                                               }
                                                        } catch (error) {
                                                               logger?.error(
                                                                      typeof error ===
                                                                             "string"
                                                                             ? error
                                                                             : (
                                                                                      error as any
                                                                               )
                                                                                      ?.message,
                                                               );
                                                        }
                                                 }
                                          }
                                   }
                            } else {
                                   /** File or directory removed, therefore remove from watch list */
                                   self.unwatch(fullName);

                                   self.emit(FILE_DELETE_EVENT, {
                                          type: stats.isDirectory()
                                                 ? "directory"
                                                 : "file",
                                          extension: extension(fullName),
                                          name: filename(fullName),
                                          size: stats.size,
                                          path: fullName,
                                          level: level,
                                   });
                            }
                     } catch (error) {
                            logger?.error(
                                   typeof error === "string"
                                          ? error
                                          : (error as any)?.message,
                            );
                     }
              },
       );

       _watcher.on("error", (error: Error) => {
              logger?.error(typeof error === "string" ? error : error?.message);
              /** @see unwatch file/folder if an error occured */
              self.unwatch(fileOrDirectory);
       });

       return _watcher;
};

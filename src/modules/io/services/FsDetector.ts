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
       FILE_UNWATCH_EVENT,
} from "../../../global/file.events";

import { stat, readdir, open, FileHandle } from "node:fs/promises";
import { FileWatchOptions } from "../../../types/FileWatchOptions";
import { DetectorOptions } from "../../../types/DetectorOptions";
import { extension, filename } from "../../../tools/io";
import { WatcherRef } from "../../../types/WatcherRef";
import { Watcher } from "../../../types/FileWatcher";
import { FSWatcher, Stats, watch } from "node:fs";
import { LogService } from "@geeko/log";
import { EventEmitter } from "tseep";
import { sep } from "node:path";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * File detector service
 *
 * @public
 */
export class FsDetector extends EventEmitter {
       /**
        * @public
        * @param {Watcher<FSWatcher>} watcher
        * @param {DetectorOptions} options
        */
       public constructor(
              watcher?: Watcher<FSWatcher>,
              options?: DetectorOptions,
       ) {
              super();

              this._watcher = watcher ?? (watch as any);
              this._logger = options?.logger;
       }

       /**
        * @see FSWatcher collection map
        *
        * @private
        * @type {Map<FSWatcher, String>}
        */
       private _watchers: Map<string, WatcherRef> = new Map();

       /**
        * Underlying @see Watcher factory function reference
        *
        * @private
        * @type {Watcher}
        */
       private _watcher: Watcher<FSWatcher> | undefined = void 0;

       /**
        * Initial root directory or file being observed
        *
        * @private
        * @type {String}
        */
       private _root: string | undefined = void 0;

       /**
        * Log provider
        *
        * @private
        * @type {LogService}
        */
       private _logger: LogService | undefined = void 0;

       /**
        * Initializes the @see FSWatcher & emits file events based on the IO changes
        *
        * @public
        * @param {FileWatchOptions} options
        * @returns {Promise<void>}
        */
       public async watch(options: FileWatchOptions): Promise<void> {
              const self: FsDetector = this;

              if (!self._watcher) {
                     return void 0;
              }

              const fileOrDirectory: string = options?.path;

              if (self._watchers.has(fileOrDirectory) === true) {
                     return void 0;
              }

              /** @TODO push to @see Threadpool if configured */
              
              const recursive: boolean =
                     options?.recursive === false ? false : true;

              const stats: Stats = await stat(fileOrDirectory);
              const level: number = options.level ?? 0;

              let root: string | undefined = options.root;

              if (stats.isDirectory()) {
                     root = root ?? fileOrDirectory;

                     /** Watch each individual file changes if specified - @see recursive */
                     const files: Array<string> = (await readdir(
                            fileOrDirectory,
                            {
                                   recursive,
                            },
                     )) as Array<string>;

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
                                          (self.isRoot(root, fileName) &&
                                                 recursive === false)
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
                                   self._logger?.error(
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

              const watcher: FSWatcher = self._watcher(
                     fileOrDirectory,
                     async (
                            eventType: string,
                            fileName: string,
                     ): Promise<void> => {
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
                                                        self.emit(
                                                               FILE_CHANGE_EVENT,
                                                               {
                                                                      root: this.absolute(
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
                                                               },
                                                        );
                                                 }

                                                 lastChange = modifiedAt;
                                          } else if (stats.isDirectory()) {
                                                 root = self.absolute(fullName);

                                                 /** Assume directory is new */
                                                 if (
                                                        self._watchers.has(
                                                               fullName,
                                                        ) === false
                                                 ) {
                                                        self.emit(
                                                               FILE_CREATE_EVENT,
                                                               {
                                                                      name: filename(
                                                                             fullName,
                                                                      ),
                                                                      type: "directory",
                                                                      size: stats.size,
                                                                      path: fullName,
                                                                      level: level,
                                                                      root: root,
                                                               },
                                                        );
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
                                                                             self._watchers.has(
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
                                                                      self._logger?.error(
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
                                   self._logger?.error(
                                          typeof error === "string"
                                                 ? error
                                                 : (error as any)?.message,
                                   );
                            }
                     },
              );

              watcher.on("error", (error: Error) => {
                     self._logger?.error(
                            typeof error === "string" ? error : error?.message,
                     );
                     /** @see unwatch file/folder if an error occured */
                     self.unwatch(fileOrDirectory);
              });

              /** Add watcher to @see Collection */
              self._watchers.set(fileOrDirectory, { watcher, root });
       }

       /**
        * Removes the specified path from the watch list - closing the @see FSWatcher
        *
        * @public
        * @param {String} path
        */
       public unwatch(path: string): void {
              if (this._watchers.has(path) === true) {
                     const watchers: WatcherRef | undefined =
                            this._watchers.get(path);

                     if (!watchers) {
                            return void 0;
                     }

                     watchers.watcher.close();
                     /** Finally remove from watch list */
                     this._watchers.delete(path);
              }

              this.emit(FILE_UNWATCH_EVENT, {
                     path: path,
              });
       }

       /**
        * Checks if the provided @see String path is the initial observed root path
        *
        * @protected
        * @param {String} path
        * @returns {Boolean}
        */
       protected isRoot(root: string, path: string): boolean {
              return root === path;
       }

       /**
        * Gets the absolute root from a given path, relative to the @see this._root
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       public absolute(path: string): string | undefined {
              if (this._watchers.has(path) === true) {
                     return this._watchers.get(path)?.root;
              }

              return void 0;
       }

       /**
        * Helper for retrieving the relative path of an object to the @see this.root
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       public relative(path: string): string {
              if (this._root) {
                     return path.replace(this._root, "").replace(sep, "");
              }

              return "";
       }
}

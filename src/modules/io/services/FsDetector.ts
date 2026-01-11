/**
     MIT License

     @Copyright (c) Metwas

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above Copyright notice and this permission notice shall be included in all
     copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR Copyright HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     SOFTWARE.
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
        * @param {LogService} logger
        * @param {DetectorOptions} options
        */
       public constructor(
              watcher?: Watcher<FSWatcher>,
              logger?: LogService,
              options?: DetectorOptions,
       ) {
              super();

              this._watcher = watcher ?? watch;
              this._logger = logger;
       }

       /**
        * @see FSWatcher collection map
        *
        * @private
        * @type {Map<FSWatcher, String>}
        */
       private _watchers: Map<string, { watcher: FSWatcher; root: string }> =
              new Map();

       /**
        * Underlying @see Watcher factory function reference
        *
        * @private
        * @type {Watcher}
        */
       private _watcher: Watcher<FSWatcher> = null;

       /**
        * Initial root directory or file being observed
        *
        * @private
        * @type {String}
        */
       private _root: string = null;

       /**
        * Log provider
        *
        * @private
        * @type {LogService}
        */
       private _logger: LogService = null;

       /**
        * Initializes the @see FSWatcher & emits file events based on the IO changes
        *
        * @public
        * @param {FileWatchOptions} options
        *
        * @throws If file or directory does not exist
        */
       public async watch(options: FileWatchOptions): Promise<void> {
              const self: FsDetector = this;

              const fileOrDirectory: string = options?.path;
              const recursive: boolean =
                     options?.recursive === false ? false : true;

              const stats: Stats = await stat(fileOrDirectory);
              const level: number = options.level ?? 0;
              let root: string = options.root;

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
                                          (this.isRootDirectory(
                                                 root,
                                                 fileName,
                                          ) &&
                                                 recursive === false)
                                   ) {
                                          continue;
                                   }

                                   this.watch({
                                          recursive: recursive,
                                          level: level + 1,
                                          path: fileName,
                                          root: fileName,
                                   });
                            } catch (error) {
                                   this._logger?.error(
                                          typeof error === "string"
                                                 ? error
                                                 : error.message,
                                   );
                            }
                     }
              }

              if (this._watchers.has(fileOrDirectory) === false) {
                     let lastChange: number = null;

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

                     const watcher: FSWatcher = this._watcher(
                            fileOrDirectory,
                            async (
                                   eventType: string,
                                   fileName: string,
                            ): Promise<void> => {
                                   try {
                                          const fullName: string = `${fileOrDirectory}/${fileName}`;
                                          const canRead: FileHandle =
                                                 await open(fullName, "r");

                                          if (canRead) {
                                                 const stats:
                                                        | Stats
                                                        | undefined =
                                                        await stat(fullName);

                                                 if (!stats) {
                                                        return void 0;
                                                 }

                                                 if (stats.isFile()) {
                                                        const modifiedAt: number =
                                                               stats.mtime.getTime();
                                                        /** Check if file has been modified */
                                                        if (
                                                               lastChange ===
                                                                      null ||
                                                               modifiedAt >
                                                                      lastChange
                                                        ) {
                                                               self.emit(
                                                                      FILE_CHANGE_EVENT,
                                                                      {
                                                                             root: this.getAbsoluteRoot(
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
                                                 } else if (
                                                        stats.isDirectory()
                                                 ) {
                                                        root =
                                                               this.getAbsoluteRoot(
                                                                      fullName,
                                                               );

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
                                                        if (
                                                               recursive ===
                                                               true
                                                        ) {
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
                                                                      index <
                                                                      length;
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
                                                                             this._logger?.error(
                                                                                    typeof error ===
                                                                                           "string"
                                                                                           ? error
                                                                                           : error.message,
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
                                                        extension: extension(
                                                               fullName,
                                                        ),
                                                        name: filename(
                                                               fullName,
                                                        ),
                                                        size: stats.size,
                                                        path: fullName,
                                                        level: level,
                                                 });
                                          }
                                   } catch (error) {
                                          this._logger?.error(
                                                 typeof error === "string"
                                                        ? error
                                                        : error.message,
                                          );
                                   }
                            },
                     );

                     watcher.on("error", (error: Error) => {
                            self._logger?.error(
                                   typeof error === "string"
                                          ? error
                                          : error?.message,
                            );
                            /** @see unwatch file/folder if an error occured */
                            self.unwatch(fileOrDirectory);
                     });

                     /** Add watcher to @see Collection */
                     this._watchers.set(fileOrDirectory, { watcher, root });
              }
       }

       /**
        * Removes the specified path from the watch list - closing the @see FSWatcher
        *
        * @public
        * @param {String} name
        */
       public unwatch(path: string): void {
              if (this._watchers.has(path) === true) {
                     const { watcher, root } = this._watchers.get(path);

                     watcher.close();
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
       protected isRootDirectory(root: string, path: string): boolean {
              return root === path;
       }

       /**
        * Gets the absolute root from a given path, relative to the @see this._root
        *
        * @protected
        * @param {String} path
        * @returns {String}
        */
       protected getAbsoluteRoot(path: string): string {
              if (this._watchers.has(path) === true) {
                     return this._watchers.get(path)?.root;
              }

              return void 0;
       }

       /**
        * Helper for retrieving the relative path of an object to the @see this.root
        *
        * @protected
        * @param {String} path
        * @returns {String}
        */
       protected getRelativePath(path: string): string {
              if (this._root) {
                     return path.replace(this._root, "").replace(sep, "");
              }

              return "";
       }
}

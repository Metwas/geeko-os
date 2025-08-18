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

/**_-_-_-_-_-_-_-_-_-_-_-_-_- @Imports _-_-_-_-_-_-_-_-_-_-_-_-_-*/

import { FILE_CHANGE_EVENT, FILE_CREATE_EVENT, FILE_DELETE_EVENT, FILE_UNWATCH_EVENT } from "../global/file.events";
import { FSWatcher, Stats, existsSync, readdirSync, statSync, watch } from "node:fs";
import { FileWatchOptions } from "../interfaces/FileWatchOptions";
import { extension, filename } from "../tools/file";
import { directory } from "../tools/directory";
import { Watcher } from "../types/FileWatcher";
import { EventEmitter } from "node:stream";
import { Collection } from "@geeko/core";
import { LogService } from "@geeko/log";
import { sep } from "node:path";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * File detector service
 * 
 * @public
 */
export class FsDetector extends EventEmitter
{
       /**
        * Accepts a  @see Watcher factory function - otherwise uses the default @see fs.watch
        * 
        * @public
        * @param {Watcher} watcher 
        */
       public constructor( options?: { watcher?: Watcher<FSWatcher>, logger?: LogService } )
       {
              super();

              this.watcher = options?.[ "watcher" ] || watch;
              this.logger = options?.[ "logger" ];
       }

       /**
        * @see FSWatcher collection map
        * 
        * @protected
        * @type {Collection<FSWatcher, String>} 
        */
       protected watchers: Collection<FSWatcher, string> = new Collection();

       /**
        * Debugger service
        * 
        * @protected
        * @type {LogService}
        */
       protected logger: LogService = null;

       /**
        * Underlying @see Watcher factory function reference
        * 
        * @protected
        * @type {Watcher}
        */
       protected watcher: Watcher<FSWatcher> = null;

       /**
        * Initial root directory or file being observed
        * 
        * @protected
        * @type {String}
        */
       protected root: string = null;

       /**
        * Initializes the @see FSWatcher & emits file events based on the IO changes
        * 
        * @public
        * @param {FileWatchOptions} options
        * 
        * @throws If file or directory does not exist
        */
       public watch( options: FileWatchOptions ): void
       {
              const self: FsDetector = this;

              const fileOrDirectory: string = options?.[ "path" ];
              const recursive: boolean = options?.[ "recursive" ] === false ? false : true;

              const stats: Stats = statSync( fileOrDirectory );

              if ( stats.isDirectory() )
              {
                     if ( !this.root )
                     {
                            this.root = fileOrDirectory;
                     }

                     /** Watch each individual file changes if specified - @see recursive */
                     const files: Array<string> = readdirSync( fileOrDirectory, { recursive } ) as Array<string>;
                     const length: number = files.length;
                     let index: number = 0;

                     for ( ; index < length; index++ )
                     {
                            try
                            {
                                   const fileName: string = `${fileOrDirectory}${sep}${files[ index ]}`;
                                   const istats: Stats = statSync( fileName );

                                   /** Skip if @see recursive & not of root if placed in another directory */
                                   if ( istats.isFile() && this.isRootDirectory( directory( fileName ) ) === false && recursive === false )
                                   {
                                          continue;
                                   }

                                   this.watch( {
                                          path: fileName,
                                          recursive: recursive
                                   } );
                            }
                            catch ( error )
                            {
                                   this.error( error );
                            }
                     }
              }

              if ( this.watchers.has( fileOrDirectory ) === false )
              {
                     let lastChange: number = null;

                     const watcher: FSWatcher = this.watcher( fileOrDirectory, ( eventType: string, fileName: string ) =>
                     {
                            if ( existsSync( fileOrDirectory ) )
                            {
                                   const stats: Stats = statSync( fileOrDirectory );

                                   if ( stats.isFile() )
                                   {
                                          const modifiedAt: number = stats.mtime.getTime();
                                          /** Check if file has been modified */
                                          if ( lastChange === null || modifiedAt > lastChange )
                                          {
                                                 self.emit( FILE_CHANGE_EVENT, {
                                                        relativePath: this.getRelativePath( fileOrDirectory ),
                                                        extension: extension( fileOrDirectory ),
                                                        name: filename( fileOrDirectory ),
                                                        path: fileOrDirectory,
                                                        type: "file",
                                                        stats: stats
                                                 } );
                                          }

                                          lastChange = modifiedAt;
                                   }
                                   else if ( stats.isDirectory() )
                                   {
                                          /** Assume directory is new */
                                          if ( self.watchers.has( fileOrDirectory ) === false )
                                          {
                                                 self.emit( FILE_CREATE_EVENT, {
                                                        relativePath: this.getRelativePath( fileOrDirectory ),
                                                        name: filename( fileOrDirectory ),
                                                        path: fileOrDirectory,
                                                        type: "directory",
                                                        stats: stats
                                                 } );
                                          }

                                          /** Otherwise check for any newly added files if @see recursive is set  */
                                          if ( this.isRootDirectory( fileOrDirectory ) || recursive === true )
                                          {
                                                 const files: Array<string> = readdirSync( fileOrDirectory, { recursive } ) as Array<string>;
                                                 const length: number = files.length;
                                                 let index: number = 0;

                                                 for ( ; index < length; index++ )
                                                 {
                                                        try
                                                        {
                                                               const file: string = `${fileOrDirectory}${sep}${files[ index ]}`;
                                                               /** Add to watch list if not already added */
                                                               if ( self.watchers.has( file ) === false )
                                                               {
                                                                      self.watch( {
                                                                             path: file,
                                                                             recursive: recursive,
                                                                      } );

                                                                      const stats: Stats = statSync( file )

                                                                      self.emit( FILE_CREATE_EVENT, {
                                                                             relativePath: this.getRelativePath( fileOrDirectory ),
                                                                             type: stats.isDirectory() ? "directory" : "file",
                                                                             extension: extension( file ),
                                                                             name: filename( file ),
                                                                             path: file,
                                                                      } );
                                                               }
                                                        }
                                                        catch ( error )
                                                        {
                                                               this.error( error );
                                                        }
                                                 }
                                          }
                                   }
                            }
                            else
                            {
                                   /** File or directory removed, therefore remove from watch list */
                                   self.unwatch( fileOrDirectory );
                                   self.emit( FILE_DELETE_EVENT, {
                                          relativePath: this.getRelativePath( fileOrDirectory ),
                                          type: stats.isDirectory() ? "directory" : "file",
                                          extension: extension( fileOrDirectory ),
                                          name: filename( fileOrDirectory ),
                                          path: fileOrDirectory,
                                   } );
                            }
                     } );

                     watcher.on( "error", ( error: Error ) =>
                     {
                            /** @see unwatch file/folder if an error occured */
                            self.unwatch( fileOrDirectory );
                            self.error( error );
                     } );

                     /** Add watcher to @see Collection */
                     this.watchers.add( fileOrDirectory, watcher );
              }
       }

       /**
        * Removes the specified path from the watch list - closing the @see FSWatcher
        * 
        * @public
        * @param {String} name 
        */
       public unwatch( path: string ): void
       {
              if ( this.watchers.has( path ) === true )
              {
                     const watcher: FSWatcher = this.watchers.get( path );
                     watcher.close();
                     /** Finally remove from watch list */
                     this.watchers.delete( path );
              }

              this.emit( FILE_UNWATCH_EVENT, {
                     path: path
              } );
       }

       /**
        * Checks if the provided @see String path is the initial observed root path
        * 
        * @protected
        * @param {String} path 
        * @returns {Boolean}
        */
       protected isRootDirectory( path: string ): boolean
       {
              return ( this.root === path );
       }

       /**
        * Helper for retrieving the relative path of an object to the @see this.root
        * 
        * @protected
        * @param {String} path 
        * @returns {String}
        */
       protected getRelativePath( path: string ): string
       {
              if ( this.root )
              {
                     return path.replace( this.root, "" ).replace( sep, "" );
              }

              return "";
       }

       /**
        * Error debug helper function
        * 
        * @protected
        * @param {Error} error 
        */
       protected error( error: Error )
       {
              if ( this.logger )
              {
                     this.logger.error( error.message );
              }
       }
}
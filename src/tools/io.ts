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

import { existsSync, lstatSync, readFile, readdir, unlink, unlinkSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, resolve, sep } from "node:path";
import { Readable } from "node:stream";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Used to match a valid directory path
 * 
 * @public
 * @type {RegExp}
 */
export const DIRECTORY_REGEX: RegExp = /(.*[\/\\])?.*/;

/**
 * HTTP @see Protocol regular expression
 * 
 * @public
 * @type {RegExp}
 */
export const HTTP_REGEX: RegExp = /^http:\/\//;

/**
 * HTTPS @see Protocol regular expression
 * 
 * @public
 * @type {RegExp}
 */
export const HTTPS_REGEX: RegExp = /^https:\/\//;

/**
 * File @see Protocol regular expression
 * 
 * @public
 * @type {RegExp}
 */
export const FILE_REGEX: RegExp = /^file:\/\//;

/**
 * FTP @see Protocol regular expression
 * 
 * @public
 * @type {RegExp}
 */
export const FTP_REGEX: RegExp = /^ftp:\/\//;

/**
 * Gets the name of the file at the absolute @see String path provided
 * 
 * @public
 * @param {String} path 
 * @returns {String}
 */
export const extension = ( path: string ): string =>
{
       return extname( path );
};

/**
 * Gets the name of the file at the absolute @see String path provided
 * 
 * @public
 * @param {String} path 
 * @param {Boolean} includeExtension 
 * @returns {String}
 */
export const filename = ( path: string, includeExtension?: boolean ): string =>
{
       const extensionType: string = includeExtension ? extension( path ) : "";
       /** Remove extension if specified - @see includeExtension */
       return basename( path, extensionType );
};

/**
 * Checks if the given path contains a file-like path
 * 
 * @public
 * @param {String} path 
 * @returns {Boolean}
 */
export const isFilePath = ( path: string ): boolean =>
{
       const baseName: string = basename( path );
       return baseName.includes( '.' ) && extname( baseName ).length > 1;
};

/**
 * @see directory function options
 * 
 * @public
 */
export type DirectoryScanOptions = {
       skipIfDirectory?: boolean;
       useNative?: boolean;
       nameOnly?: boolean;
};

/**
 * Checks if the specified path is a valid system directory
 * 
 * @public
 * @param {String} path 
 * @returns {Boolean}
 */
export const isDirectory = ( path: string ): boolean =>
{
       try
       {
              return lstatSync( path ).isDirectory() === true;
       }
       catch ( error )
       {
              return void 0;
       }
};

/**
 * Gets the directory name from the specified @see String file path
 * 
 * @public
 * @param {String} filePath 
 * @param {DirectoryScanOptions} options
 * @returns {String}
 */
export const directory = ( filePath: string, options?: DirectoryScanOptions ): string =>
{
       try
       {
              if ( options?.[ "skipIfDirectory" ] === true && isDirectory( filePath ) === true )
              {
                     return filePath;
              }

              if ( options?.[ "useNative" ] === true )
              {
                     return dirname( filePath );
              }

              const directoryPath: string = filePath.replace( DIRECTORY_REGEX, "$1" );

              if ( options?.[ "nameOnly" ] === true )
              {
                     const directories: Array<string> = directoryPath.split( sep );

                     while ( directories.length > 0 )
                     {
                            const directoryName: string = directories.pop();

                            if ( directoryName )
                            {
                                   return directoryName;
                            }
                     }
              }

              return directoryPath;
       }
       catch ( error )
       {
              return filePath;
       }
};

/**
 * Creates a path from the provided name & directory
 * 
 * @public
 * @param {String} name 
 * @param {String} directory 
 * @returns {String}
 */
export const getNamedPath = ( name: string, directory: string ): string =>
{
       return directory + "/" + name;
};

/**
 * Reads file data into a @see Buffer
 * 
 * @public
 * @param {String} filePath 
 * @returns {Promise<Buffer>}
 */
export const readFileData = ( filePath: string ): Promise<Buffer> =>
{
       return new Promise( ( resolve, reject ) =>
       {
              readFile( filePath, ( error, buffer ) =>
              {
                     error ? reject( error ) : resolve( buffer );
              } );
       } );
};

/**
 * Gets all file contents recursivly from the root directory
 * 
 * @public
 * @param {String} root 
 * @param {Object} options 
 * @returns {Promise<Array<any>>}
 */
export const getDirectoryFiles = ( root: string, options?: any ): Promise<Array<any>> =>
{
       const _files: Array<any> = [];
       const _maxLevel: number = ( options || {} ).maxLevel || null;

       return new Promise( async ( resolve, reject ) =>
       {
              await ( async function get( fullPath: string, cursor?: number )
              {
                     cursor = cursor || 0;
                     if ( _maxLevel && cursor >= _maxLevel )
                     {
                            return;
                     }

                     return new Promise( ( resolve, reject ) =>
                     {
                            readdir( fullPath, { withFileTypes: true }, async ( error, files ) =>
                            {
                                   if ( error )
                                   {
                                          console.error( error.message );
                                          return;
                                   }

                                   const length: number = Array.isArray( files ) ? files.length : 0;
                                   let index: number = 0;

                                   for ( ; index < length; index++ )
                                   {
                                          try
                                          {
                                                 const file: any = files[ index ];

                                                 if ( ( file || {} ).isDirectory() )
                                                 {
                                                        let _cursor = cursor || 0;
                                                        await get( getNamedPath( file.name, fullPath ), ++_cursor );
                                                 }
                                                 else if ( file !== void 0 )
                                                 {
                                                        const filePath = getNamedPath( file.name, fullPath );
                                                        // read into buffer
                                                        _files.push( {
                                                               name: file.name,
                                                               fullPath: filePath,
                                                               buffer: await readFileData( filePath )
                                                        } );
                                                 }
                                          }
                                          catch ( error )
                                          {
                                                 console.error( error.message );
                                          }
                                   }

                                   resolve( null );
                            } );
                     } );
              } )( root );

              resolve( _files );
       } );
};

/**
 * Attempts to read the buffer as a @see String from the provided @see Readable stream
 * 
 * @public
 * @param {Readable} stream 
 * @returns {string}
 */
export const readAsString = ( stream: Readable ): Promise<string> =>
{
       if ( !stream )
       {
              return Promise.resolve( null );
       }

       return new Promise( ( resolve, _ ) =>
       {
              let buffer: string = "";

              stream.on( 'data', ( chunk: string ) =>
              {
                     buffer += chunk;
              } );

              stream.once( "error", () =>
              {
                     stream.destroy();
                     buffer = null;
                     resolve( null );
              } );

              stream.once( "end", () =>
              {
                     resolve( buffer );
              } );
       } );
}

/**
 * Builds the full path for the specified @see String file path
 * 
 * @public
 * @param {String} filePath 
 * @returns {String}
 */
export const buildPath = ( filePath: string ): string =>
{
       if ( typeof filePath === "string" )
       {
              return resolve( directory( filePath ), filePath );
       }
};

/**
 * Ensures that the provided path is absolute
 * 
 * @public
 * @param {String} path 
 * @returns {String}
 */
export const makeAbsolutePath = ( path: string ): string =>
{
       if ( isAbsolute( path ) === false )
       {
              return resolve( path );
       }

       return path;
};

/**
 * Removes/Unlinks the file specified at the @see String path
 * 
 * @public
 * @param {String} path 
 */
export const deleteFileSync = ( path: string ): void =>
{
       if ( existsSync( path ) === true )
       {
              unlinkSync( path );
       }
};

/**
 * Removes/Unlinks the file specified at the @see String path
 * 
 * @public
 * @param {String} path 
 * @returns {Promise<void>}
 */
export const deleteFile = ( path: string ): Promise<void> =>
{
       return new Promise( ( resolve, reject ) =>
       {
              unlink( path, ( error: Error ) =>
              {
                     error ? reject( error ) : resolve( null );
              } );
       } );
};
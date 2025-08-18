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

import { dirname, sep } from "node:path";
import { lstatSync } from "node:fs";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Used to match a valid directory path
 * 
 * @public
 * @type {RegExp}
 */
export const DIRECTORY_REGEX: RegExp = /(.*[\/\\])?.*/;

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
       return lstatSync( path ).isDirectory() === true;
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
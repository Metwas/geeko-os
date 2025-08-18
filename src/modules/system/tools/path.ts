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
export const isPath = ( path: string ): boolean =>
{
       if ( typeof path !== "string" )
       {
              return false;
       }

       return ( path.indexOf( "/" ) > -1 ) || ( path.indexOf( "\\" ) > -1 );
};

/**
 * Systems path resolve helper
 * 
 * @public
 * @param {String} path 
 * @returns {String}
 */
export const resolvePath = ( path: string, quoteOnlySpaces: boolean = false ): string =>
{
       if ( isPath( path ) === false )
       {
              return path;
       }

       const resolvedPath: string = isAbsolute( path ) ? path : resolve( __dirname, path );
       // wrap in quotes if set
       return ( quoteOnlySpaces ? resolveSpacedPath( resolvedPath ) : resolvedPath );
};

/**
 * Resolves any spaces within the provided path by wrapping "" (Windows)
 * 
 * @public
 * @param {String} path 
 * @returns {String}
 */
export const resolveSpacedPath = ( path: string ): string =>
{
       let local: string = path;

       let spaceRegex: RegExp = /[\(\)a-zA-Z0-9_]+( [\(\)a-zA-Z0-9_]+)+/g;

       const spaces: Array<string> = local.match( spaceRegex );
       const length: number = Array.isArray( spaces ) ? spaces.length : 0;
       let index: number = 0;

       for ( ; index < length; index++ )
       {
              const space: string = spaces[ index ];
              // add quotes around the space directory
              local = local.replace( space, `"${space}"` );
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
export const getFileNameFromPath = ( path: string ): string =>
{
       if ( typeof path === "string" && existsSync( path ) )
       {
              return basename( path );
       }

       return "";
}
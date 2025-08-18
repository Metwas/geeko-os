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

import { LINUX_OBJECT_SCAN_COMMAND, LINUX_OBJECT_WHERE_COMMAND } from "../constants/linux.constants";
import { buildLinuxSearchOptions, buildSearchResponse } from "./scan.builder";
import { splitNewline, replaceSpacesForNewline } from "./text.utilities";
import { SystemSearchOptions } from "../interfaces/SystemSearchOptions";
import { IOSProvider } from "../interfaces/os";
import { CollectionMap } from "@geeko/core";
import { exec } from "node:child_process";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Using the default 'where' command, this searches the current system for the specified file, executable or variable depending on the provided scope
 * 
 * @public
 * @param {IOSProvider} provider
 * @param {Array<string> | String} searchTerm 
 * @param {SystemSearchOptions} options 
 * @returns {Promise<Array<string>>}
 */
export const whereIs = ( provider: IOSProvider, options?: SystemSearchOptions ): Promise<CollectionMap<string>> =>
{
       return new Promise<CollectionMap<string>>( ( resolve, reject ) =>
       {
              let search: Array<string> = Array.isArray( options?.name ) ? options.name : [ options?.name ];
              const flags: Array<string> = buildLinuxSearchOptions( provider, search, options );

              const command: string = ( ( options.scope === "application" ) ? LINUX_OBJECT_WHERE_COMMAND : LINUX_OBJECT_SCAN_COMMAND );

              exec( `${command} ${flags.join( " " )} 2>/dev/null`, ( error: Error, stdout: string, stderr: string ) =>
              {
                     if ( stderr || !stdout )
                     {
                            resolve( null );
                     }
                     else
                     {
                            resolve( buildSearchResponse( splitNewline( replaceSpacesForNewline( stdout ) ), {
                                   keys: search,
                                   options: options
                            } ) );
                     }
              } );
       } );
};
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

import { readFile, readdir } from "node:fs";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

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

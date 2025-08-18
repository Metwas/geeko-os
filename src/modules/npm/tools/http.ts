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

import { ClientRequest, IncomingMessage } from "node:http";
import { WriteStream } from "node:fs";
import https from "node:https";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * HTTPS get request async wrapper function
 * 
 * @public
 * @param {String} url 
 * @returns {Promise<string>}
 */
export const HTTPS_GET_ASYNC = ( url: string ): Promise<string> =>
{
       return new Promise<string>( ( resolve, reject ) =>
       {
              let buffer: string = "";

              https.get( url, ( response: IncomingMessage ) =>
              {
                     response.on( "data", ( chunk: string ) =>
                     {
                            buffer += chunk;
                     } );

                     response.on( "end", () =>
                     {
                            resolve( buffer );
                     } );

                     response.on( "error", ( error: Error ) =>
                     {
                            buffer = null;
                            reject( error );
                     } );
              } );
       } );
};


/**
 * HTTPS get request async wrapper function which pipes the response to the provided @see WriteStream
 * 
 * @public
 * @param {String} url
 * @param {WriteStream} stream
 * @returns {Promise<string>}
 */
export const HTTPS_GET_ASYNC_STREAM = ( url: string, stream: WriteStream ): Promise<boolean> =>
{
       return new Promise<boolean>( ( resolve, reject ) =>
       {
              const request: ClientRequest = https.get( url, ( response: IncomingMessage ) =>
              {
                     response.pipe( stream );

                     stream.on( "finish", () =>
                     {
                            resolve( true );
                     } );
              } );

              request.on( "error", ( error: Error ) =>
              {
                     reject( error );
              } );
       } );
};


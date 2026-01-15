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
export const HTTPS_GET_ASYNC = (url: string): Promise<string> => {
       return new Promise<string>((resolve, reject) => {
              let buffer: string = "";

              https.get(url, (response: IncomingMessage) => {
                     response.on("data", (chunk: string) => {
                            buffer += chunk;
                     });

                     response.on("end", () => {
                            resolve(buffer);
                     });

                     response.on("error", (error: Error) => {
                            buffer = null;
                            reject(error);
                     });
              });
       });
};

/**
 * HTTPS get request async wrapper function which pipes the response to the provided @see WriteStream
 *
 * @public
 * @param {String} url
 * @param {WriteStream} stream
 * @returns {Promise<string>}
 */
export const HTTPS_GET_ASYNC_STREAM = (
       url: string,
       stream: WriteStream,
): Promise<boolean> => {
       return new Promise<boolean>((resolve, reject) => {
              const request: ClientRequest = https.get(
                     url,
                     (response: IncomingMessage) => {
                            response.pipe(stream);

                            stream.on("finish", () => {
                                   resolve(true);
                            });
                     },
              );

              request.on("error", (error: Error) => {
                     reject(error);
              });
       });
};

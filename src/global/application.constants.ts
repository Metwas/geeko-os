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

/**
 * @see ChildProcess message channel
 *
 * @public
 * @type {String}
 */
export const PROCESS_MESSAGE_CHANNEL: string = "message";

/**
 * @see ChildProcess error channel
 *
 * @public
 * @type {String}
 */
export const PROCESS_ERROR_CHANNEL: string = "error";

/**
 * @see ChildProcess close channel
 *
 * @public
 * @type {String}
 */
export const PROCESS_CLOSE_CHANNEL: string = "close";

/**
 * Chrome-based executable path stored within the enviroment variable
 *
 * @public
 * @type {String}
 */
export const CHROME_ENV_TOKEN: string = "CHROME_PATH";

/**
 * Default chromium remote-debugging port
 *
 * @public
 * @type {Number}
 */
export const DEFAULT_REMOTE_DEBUG_PORT: number = 9222;

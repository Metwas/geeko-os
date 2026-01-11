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

import { ThreadPoolOptions } from "../../types/ThreadPoolOptions";
import { Worker } from "node:worker_threads";
import { cpus } from "node:os";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * @see Worker thread pool interface
 *
 * @public
 */
export class ThreadPool {
       /**
        * @public
        * @param {ThreadPoolOptions} options
        */
       public constructor(options: ThreadPoolOptions) {
              this._size = options?.size ?? cpus().length;
              this._file = options?.file;
       }

       /**
        * Thread pool count
        *
        * @private
        * @type {Number}
        */
       private _size: number;

       /**
        * Thread pool execution file path
        *
        * @private
        * @type {String}
        */
       private _file: string;

       private _threads: Array<Worker> = [];
       private _idle: Array<Worker> = [];
       private _queue: Array<any> = [];

       /**
        * Gets/Sets the thread pool count
        *
        * @public
        * @param {Number} size
        * @returns {Number}
        */
       public size(size?: number): number {
              if (typeof size === "number" && size > 0) {
                     this._size = size;
              }

              return this._size;
       }

       /**
        * Gets/Sets the thread pool execution file path
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       public file(path?: string): string {
              if (typeof path === "string") {
                     this._file = path;
              }

              return this._file;
       }

       public spawn(data?: any): Promise<void> {}
}

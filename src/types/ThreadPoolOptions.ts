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

import { WorkerOptions } from "node:worker_threads";
import { IEvents } from "../modules/threads/IEvent";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * @public
 * @type {Number | "auto"}
 */
export type ThreadCount = number | "auto";

/**
 * @see ThreadPool constructor options
 *
 * @public
 */
export type ThreadPoolOptions = {
       /**
        * Number of threads to manage
        *
        * @public
        * @type {ThreadCount}
        */
       size?: ThreadCount;

       /**
        * Thread execution file path
        *
        * @public
        * @type {String}
        */
       file: string;

       /**
        * Flag to ensure thread count is maintained if one or more @see Worker(s) shutdown
        *
        * @public
        * @type {Boolean | undefined}
        */
       persistent?: boolean;

       /**
        * Event bridge or proxy
        *
        * @public
        * @type {IEvents | undefined}
        */
       bridge?: IEvents | undefined;

       /**
        * Max number of tasks in the queue backlog
        *
        * @public
        * @type {Number | undefined}
        */
       maxQueueSize?: number;

       /**
        * @see Worker based options
        *
        * @public
        * @type {WorkerOptions | undefined}
        */
       workerOptions?: WorkerOptions;
};

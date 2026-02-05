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

import { DefaultEventMap } from "tseep";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Core events interface
 *
 * @public
 */
export interface IEvents {
       /**
        * @public
        * @param {EventKey} event
        * @param {Parameters<DefaultEventMap[EventKey]>} args
        * @returns {Boolean}
        */
       emit<EventKey extends string>(
              event: EventKey,
              ...args: Parameters<DefaultEventMap[EventKey]>
       ): boolean;

       /**
        * @public
        * @param {EventKey} event
        * @param {DefaultEventMap[EventKey]} listener
        * @returns {Detector}
        */
       on<EventKey extends string>(
              event: EventKey,
              listener: DefaultEventMap[EventKey],
       ): this;

       /**
        * @public
        * @param {EventKey} event
        * @param {DefaultEventMap[EventKey]} listener
        * @returns {Detector}
        */
       once<EventKey extends string>(
              event: EventKey,
              listener: DefaultEventMap[EventKey],
       ): this;
}

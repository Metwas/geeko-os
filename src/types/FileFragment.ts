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

/**
 * File fragment strong typed
 *
 * @public
 */
export interface FileFragment {
       /**
        * File path
        *
        * @type {String}
        */
       path: string;

       /**
        * Directory of the given @see File
        *
        * @public
        * @type {String}
        */
       directory: string;

       /**
        * Optional tag for the file, usually extracted after matching a criteria based on a given regex,
        *
        * @example app.systems.json => 'systems'
        *
        * @public
        * @type {String}
        */
       tag?: string;

       /**
        * Raw data on the file
        *
        * @public
        * @type {Buffer}
        */
       data: Buffer;

       /**
        * File extension
        *
        * @public
        * @type {String}
        */
       extension?: string;
}

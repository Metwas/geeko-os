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
 * Network @see Transport options
 *
 * @public
 */
export interface NetworkTransportOptions {
       /**
        * Transport identifier
        *
        * @public
        * @type {String}
        */
       id: string;

       /**
        * Transport protocol tag
        *
        * @public
        * @type {String}
        */
       protocol: string;

       /**
        * Network endpoint/host address
        *
        * @public
        * @type {String}
        */
       host?: string;

       /**
        * Network port
        *
        * @public
        * @type {Number}
        */
       port?: number;
}

/**
 * Network interface options
 *
 * @public
 */
export interface NetworkInterfaceOptions {
       /**
        * Network interface mode
        *
        * @public
        * @type {String}
        */
       mode: string;

       /**
        * List of @see NetworkTransportOptions interfaces
        *
        * @public
        * @type {Array<NetworkTransportOptions>}
        */
       transports: Array<NetworkTransportOptions>;
}

/**
 * Network service interface
 *
 * @public
 */
export interface NetworkServiceOptions extends NetworkInterfaceOptions {
       /**
        * Network linked interfaces
        *
        * @public
        * @type {Array<NetworkServiceOptions>}
        */
       links: Array<NetworkServiceOptions>;
}

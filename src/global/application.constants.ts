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

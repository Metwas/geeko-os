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
 * Linux root '/'
 *
 * @public
 * @type {String}
 */
export const LINUX_DEFAULT_ROOT: string = "/";

/**
 * Linux home directory
 *
 * @public
 * @type {String}
 */
export const LINUX_DEFAULT_HOME: string = "~/";

/**
 * Linux default object/file or executable scan command
 *
 * @public
 * @type {String}
 */
export const LINUX_OBJECT_SCAN_COMMAND: string = "find";

/**
 * Linux default application file path search command
 *
 * @public
 * @type {String}
 */
export const LINUX_OBJECT_WHERE_COMMAND: string = "whereis";

/**
 * Standard task pkill command for linux
 *
 * @public
 * @type {String}
 */
export const LINUX_EXEC_PKILL: string = "pkill";

/**
 * Standard task kill command for linux
 *
 * @public
 * @type {String}
 */
export const LINUX_EXEC_KILL: string = "kill";

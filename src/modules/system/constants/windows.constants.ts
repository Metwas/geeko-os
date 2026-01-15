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
 * Windows root drive C:\
 *
 * @public
 * @type {String}
 */
export const WINDOWS_DEFAULT_ROOT: string = "c:\\";

/**
 * Windows default object/file or executable scan command
 *
 * @public
 * @type {String}
 */
export const WINDOWS_OBJECT_SCAN_COMMAND: string = "WHERE";

/**
 * Windows default object/file or executable start command
 *
 * @public
 * @type {String}
 */
export const WINDOWS_OBJECT_START_COMMAND: string = "START /WAIT";

/**
 * Windows task kill system command
 *
 * @public
 * @type {String}
 */
export const WINDOWS_TASK_TERMINATE: string = "TASKKILL";

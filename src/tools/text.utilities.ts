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
 * Newline + return carriage regex
 *
 * @public
 * @type {RegExp}
 */
export const NEWLINE_REGEX: RegExp = /[\r\n]/g;

/**
 * Split newline charactor
 *
 * @public
 * @param {String} value
 * @returns {Array<string>}
 */
export const splitNewline = (value: string): Array<string> => {
       return typeof value === "string" ? value.split(NEWLINE_REGEX) : [];
};

/**
 * Split any spaces between words into newlines
 *
 * @public
 * @param {String} value
 * @returns {Array<string>}
 */
export const replaceSpacesForNewline = (value: string): string => {
       return typeof value === "string" ? value.split(" ").join("\n") : "";
};

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
 * Returns a good @see Result
 *
 * @public
 */
type Ok<T> = { ok: true; value: T };

/**
 * Returns a bad @see Result
 *
 * @public
 */
type Err<E> = { ok: false; error: E };

/**
 * Type defining only two output conditions, either @see Ok OR @see Err
 *
 * @public
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Creates a @see Result wrapper around the @see T value provided
 *
 * @public
 * @param {T} value
 * @returns {Result<T, never>}
 */
export const Ok = <T>(value: T): Result<T, never> => ({
       ok: true,
       value,
});

/**
 * Creates an error @see Result wrapper
 *
 * @public
 * @param {E} error
 * @returns {Result<never, E>}
 */
export const Err = <E>(error: E): Result<never, E> => ({
       ok: false,
       error,
});

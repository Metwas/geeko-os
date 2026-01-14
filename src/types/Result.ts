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

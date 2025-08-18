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
 * File fragment strong typed
 * 
 * @public
 */
export interface FileFragment
{
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
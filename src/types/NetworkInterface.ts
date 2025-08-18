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
 * Network @see Transport options
 * 
 * @public
 */
export interface NetworkTransportOptions
{
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
export interface NetworkInterfaceOptions
{
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
export interface NetworkServiceOptions extends NetworkInterfaceOptions
{
       /**
        * Network linked interfaces
        * 
        * @public
        * @type {Array<NetworkServiceOptions>}
        */
       links: Array<NetworkServiceOptions>;
}
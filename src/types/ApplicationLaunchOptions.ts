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

/**_-_-_-_-_-_-_-_-_-_-_-_-_- Imports _-_-_-_-_-_-_-_-_-_-_-_-_-*/

import { ApplicationPlatformMap } from "./ApplicationPlatformMap";
import { ApplicationName } from "./ApplicationName";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * System process launch interface
 *
 * @public
 */
export interface ProcessLaunchOptions {
       /**
        * Launch arguments
        *
        * @public
        * @type {Array<String>}
        */
       flags?: Array<string>;

       /**
        * Clears the cached location reference for the specified application
        *
        * @public
        * @type {Boolean}
        */
       clearCache?: boolean;

       /**
        * Shell execution path, e.g /bin/bash /bin/node or node
        *
        * @public
        * @type {String}
        */
       shell?: string;

       /**
        * Optional directory specification for the given @see app
        *
        * @public
        * @type {String}
        */
       directory?: string;

       /**
        * Full executable path to the application instance/file
        *
        * @public
        * @type {String}
        */
       executablePath?: string;

       /**
        * Option to restart the application on exit
        *
        * @public
        * @type {Boolean}
        */
       restartOnExit?: boolean;

       /**
        * Flag to indicate only one instance can be running at a time
        *
        * @public
        * @type {Boolean}
        */
       exclusive?: boolean;

       /**
        * Flag to run the executable on a seperate process channel
        *
        * @public
        * @type {Boolean}
        */
       detached?: boolean;

       /**
        * Optional environments variables to be provided on launch
        *
        * @public
        * @type {String}
        */
       env?: string;
}

/**
 * Application launch options
 *
 * @public
 */
export interface ApplicationLaunchOptions extends ProcessLaunchOptions {
       /**
        * Application identification
        *
        * @public
        * @type {ApplicationName | ApplicationPlatformMap}
        */
       app: ApplicationName | ApplicationPlatformMap;
}

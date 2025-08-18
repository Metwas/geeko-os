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

/**_-_-_-_-_-_-_-_-_-_-_-_-_- @Imports _-_-_-_-_-_-_-_-_-_-_-_-_-*/

import { WindowsProvider } from "./windows/WindowsProvider";
import { RaspbianProvider } from "./linux/RasbianProvider";
import { LinuxProvider } from "./linux/LinuxProvider";
import { IOSProvider } from "./interfaces/os";
import { readFileSync } from "node:fs";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Simple check if the current system is Windows
 * 
 * @public
 * @param {String} platform
 * @returns {Boolean}
 */
export const isWindows = ( platform?: string ): boolean =>
{
       return ( platform ? platform : process.platform ).indexOf( "win" ) > -1;
};

/**
 * Simple check if the current system is Linux
 * 
 * @public
 * @param {String} platform
 * @returns {Boolean}
 */
export const isLinux = ( platform?: string ): boolean =>
{
       return ( platform ? platform : process.platform ).indexOf( "linux" ) > -1;
};

/**
 * List of possible Raspberry pi model identifiers
 * 
 * @Note https://www.raspberrypi.org/documentation/hardware/raspberrypi/
 * @public
 * @type {Object}
 */
export const PI_MODEL_IDS = {
       'BCM2708': "Pi",
       'BCM2709': "Pi",
       'BCM2710': "Pi",
       'BCM2835': "Pi1/zero",
       'BCM2836': "Pi2",
       'BCM2837': "Pi2/Pi3",
       'BCM2837B0': "Pi3B+/Pi3A+",
       'BCM2711': "Pi4B",
       'BCM2712': 'Pi5'
};

/**
 * Attempts to get the hardware Id from the supported @see PI_MODEL_IDS to test if the current device is a Raspberry Pi
 * 
 * @public
 * @returns {String}
 */
export const isRaspbian = (): string =>
{
       try
       {
              const info: string = readFileSync( '/proc/cpuinfo', { encoding: 'utf8' } );
              const indexOf: number = info.indexOf( "Hardware" );
              const hardwareId: string = info.substring( indexOf );

              return PI_MODEL_IDS[ hardwareId ];
       }
       catch ( error )
       {
              return null;
       }
}

/**
 * Main @see IOSProvider builder script
 * 
 * @returns {IOSProvider}
 */
export const getSystemProvider = ( factory?: () => IOSProvider ): IOSProvider =>
{
       if ( typeof factory === "function" )
       {
              return factory();
       }

       const platform: string = process.platform;

       if ( isWindows( platform ) === true )
       {
              return new WindowsProvider();
       }
       else if ( isLinux( platform ) === true )
       {
              const raspbian: string = isRaspbian();

              if ( raspbian )
              {
                     return new RaspbianProvider( raspbian );
              }

              return new LinuxProvider();
       }
};

/**
 * Globally available system provider
 * 
 * @public
 * @type {IOSProvider}
 */
export const GLOBAL_SYSTEM_PROVIDER: IOSProvider = getSystemProvider();
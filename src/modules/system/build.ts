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

/**_-_-_-_-_-_-_-_-_-_-_-_-_- Imports _-_-_-_-_-_-_-_-_-_-_-_-_-*/

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
export const isWindows = (platform?: string): boolean => {
       return (platform ? platform : process.platform).indexOf("win") > -1;
};

/**
 * Simple check if the current system is Linux
 *
 * @public
 * @param {String} platform
 * @returns {Boolean}
 */
export const isLinux = (platform?: string): boolean => {
       return (platform ? platform : process.platform).indexOf("linux") > -1;
};

export type JsonLike = {
       [key: string]: any;
};

/**
 * List of possible Raspberry pi model identifiers
 *
 * @Note https://www.raspberrypi.org/documentation/hardware/raspberrypi/
 * @public
 * @type {Object}
 */
export const PI_MODEL_IDS: JsonLike = {
       BCM2708: "Pi",
       BCM2709: "Pi",
       BCM2710: "Pi",
       BCM2835: "Pi1/zero",
       BCM2836: "Pi2",
       BCM2837: "Pi2/Pi3",
       BCM2837B0: "Pi3B+/Pi3A+",
       BCM2711: "Pi4B",
       BCM2712: "Pi5",
};

/**
 * Attempts to get the hardware Id from the supported @see PI_MODEL_IDS to test if the current device is a Raspberry Pi
 *
 * @public
 * @returns {String}
 */
export const isRaspbian = (): string | undefined => {
       try {
              const info: string = readFileSync("/proc/cpuinfo", {
                     encoding: "utf8",
              });
              const indexOf: number = info.indexOf("Hardware");
              const hardwareId: string = info.substring(indexOf);

              return PI_MODEL_IDS[hardwareId];
       } catch (error) {
              return void 0;
       }
};

/**
 * Main @see IOSProvider builder script
 *
 * @returns {IOSProvider}
 */
export const getSystemProvider = (
       factory?: () => IOSProvider,
): IOSProvider | undefined => {
       if (typeof factory === "function") {
              return factory();
       }

       const platform: string = process.platform;

       if (isWindows(platform) === true) {
              return new WindowsProvider();
       } else if (isLinux(platform) === true) {
              const raspbian: string | undefined = isRaspbian();

              if (raspbian) {
                     return new RaspbianProvider(raspbian);
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
export const GLOBAL_SYSTEM_PROVIDER: IOSProvider | undefined =
       getSystemProvider();

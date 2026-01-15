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

import { ApplicationPlatformMap } from "../../../../../types/ApplicationPlatformMap";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Chrome application keys
 *
 * @public
 * @type {ApplicationPlatformMap}
 */
export const CHROME_APPLICATION_MAP: ApplicationPlatformMap = {
       "google-chrome-stable": {
              weight: 0.9,
              linux: "google-chrome-stable",
              windows: "chrome.exe",
              darwin: null,
       },
       "google-chrome": {
              weight: 0.9,
              linux: "google-chrome",
              windows: "chrome.exe",
              darwin: null,
       },
       thorium: {
              weight: 1,
              linux: "thorium",
              windows: "thorium.exe",
              darwin: null,
       },
       "thorium-browser": {
              weight: 1,
              linux: "thorium-browser",
              windows: "thorium.exe",
              darwin: null,
       },
       "chromium-browser": {
              weight: 1,
              linux: "chromium-browser",
              windows: "chrome.exe",
              darwin: null,
       },
       chromium: {
              weight: 1,
              linux: "chromium",
              windows: "chrome.exe",
              darwin: null,
       },
};

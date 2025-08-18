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
              darwin: null
       },
       'google-chrome': {
              weight: 0.9,
              linux: "google-chrome",
              windows: "chrome.exe",
              darwin: null
       },
       'thorium': {
              weight: 1,
              linux: "thorium",
              windows: "thorium.exe",
              darwin: null
       },
       'thorium-browser': {
              weight: 1,
              linux: "thorium-browser",
              windows: "thorium.exe",
              darwin: null
       },
       'chromium-browser': {
              weight: 1,
              linux: "chromium-browser",
              windows: "chrome.exe",
              darwin: null
       },
       'chromium': {
              weight: 1,
              linux: "chromium",
              windows: "chrome.exe",
              darwin: null
       }
};
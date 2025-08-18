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
 * Default URL
 * 
 * @public
 * @type {String}
 */
export const DEFAULT_CHROMIUM_URL: string = "www.google.com";

/**
 * @see Chromium default launch flags which allows for a clean and minimal bootstrapping
 * 
 * @public
 * @type {ReadonlyArray<String>}
 */
export const DEFAULT_FLAGS: ReadonlyArray<string> = [
       '--disable-features=' +
       [
              'Translate',
              'OptimizationHints',
              'MediaRouter',
              'DialMediaRouteProvider',
              'CalculateNativeWinOcclusion',
              'InterestFeedContentSuggestions',
              'CertificateTransparencyComponentUpdater',
              'AutofillServerCommunication'
       ].join( ',' ),
       '--enable-features=' + [
              'ParallelDownloading',
              'UnexpireFlagsM90',
              'VaapiVideoEncoder',
              'VaapiVideoDecoder',
              'CanvasOopRasterization'
       ].join( ',' ),
       '--disable-software-rasterizer',
       '--disable-gpu-driver-workarounds',
       '--disable-gpu-vsync',
       '--enable-accelerated-2d-canvas',
       '--enable-accelerated-video-decode',
       '--enable-accelerated-mjpeg-decode',
       '--enable-drdc',
       '--enable-gpu-compositing',
       '--enable-native-gpu-memory-buffers',
       '--enable-gpu-rasterization',
       '--mute-audio',
       '--no-default-browser-check',
       '--no-first-run',
       '--disable-backgrounding-occluded-windows',
       '--disable-renderer-backgrounding',
       '--disable-background-timer-throttling',
       '--disable-ipc-flooding-protection',
       '--password-store=basic',
       '--use-mock-keychain',
       '--disable-hang-monitor',
       '--disable-prompt-on-repost',
       '--disable-domain-reliability',
];
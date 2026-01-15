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
       "--disable-features=" +
              [
                     "Translate",
                     "OptimizationHints",
                     "MediaRouter",
                     "DialMediaRouteProvider",
                     "CalculateNativeWinOcclusion",
                     "InterestFeedContentSuggestions",
                     "CertificateTransparencyComponentUpdater",
                     "AutofillServerCommunication",
              ].join(","),
       "--enable-features=" +
              [
                     "ParallelDownloading",
                     "UnexpireFlagsM90",
                     "VaapiVideoEncoder",
                     "VaapiVideoDecoder",
                     "CanvasOopRasterization",
              ].join(","),
       "--disable-software-rasterizer",
       "--disable-gpu-driver-workarounds",
       "--disable-gpu-vsync",
       "--enable-accelerated-2d-canvas",
       "--enable-accelerated-video-decode",
       "--enable-accelerated-mjpeg-decode",
       "--enable-drdc",
       "--enable-gpu-compositing",
       "--enable-native-gpu-memory-buffers",
       "--enable-gpu-rasterization",
       "--mute-audio",
       "--no-default-browser-check",
       "--no-first-run",
       "--disable-backgrounding-occluded-windows",
       "--disable-renderer-backgrounding",
       "--disable-background-timer-throttling",
       "--disable-ipc-flooding-protection",
       "--password-store=basic",
       "--use-mock-keychain",
       "--disable-hang-monitor",
       "--disable-prompt-on-repost",
       "--disable-domain-reliability",
];

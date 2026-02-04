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

const {
       FILE_CREATE_EVENT,
       FILE_CHANGE_EVENT,
       FILE_DELETE_EVENT,
       FsDetector,
} = require("../../dist/main");

const { LogService } = require("@geeko/log");
const { resolve } = require("node:path");

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

const logger = new LogService({
       title: "Fs Detector Test",
});

const detector = new FsDetector({
       logger: logger,
       workers: 4,
});

detector.on(FILE_CREATE_EVENT, (options) => {
       logger.verbose("Created: ", options);
});

detector.on(FILE_CHANGE_EVENT, (options) => {
       logger.verbose("Changed: ", options);
});

detector.on(FILE_DELETE_EVENT, (options) => {
       logger.warn("Deleted: ", options);
});

detector.watch({
       path: resolve(__dirname, "./"),
       recursive: true,
});

detector.watch({
       path: resolve(__dirname, "../launcher/"),
       recursive: false,
});

detector.watch({
       path: resolve(__dirname, "../threads/workers/"),
       recursive: false,
});

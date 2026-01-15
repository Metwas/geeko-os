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

import {
       LINUX_EXEC_KILL,
       LINUX_EXEC_PKILL,
} from "../constants/linux.constants";

import { ApplicationLaunchOptions } from "../../../types/ApplicationLaunchOptions";
import { SystemSearchOptions } from "../interfaces/SystemSearchOptions";
import { LinuxDistribution } from "../../../types/LinuxDistribution";
import { CoreOSProvider, IOSProvider } from "../interfaces/os";
import { SystemModule } from "../../../types/SystemModule";
import { buildCommandString } from "../tools/terminal";
import { homedir, platform, version } from "node:os";
import { whereIs } from "../tools/linux.scan";
import { CollectionMap } from "@geeko/core";
import { readFileSync } from "node:fs";
import { sep } from "node:path";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Linux specific operating system interface
 *
 * @public
 */
export interface ILinuxProvider extends IOSProvider {
       /**
        * Gets the current Linux distribution. e.g Ubuntu, Arch
        *
        * @public
        * @returns {LinuxDistribution}
        */
       getDistribution(): LinuxDistribution;
}

/**
 * Linux specific operating system interface
 *
 * @public
 */
export class LinuxProvider extends CoreOSProvider implements ILinuxProvider {
       /**
        * Global Linux home environment variable definition
        *
        * @public
        * @type {String}
        */
       public static USER_PROFILE: string = "/home/";

       /**
        * Default constructor
        *
        * @public
        */
       public constructor() {
              super(platform());
              // set common platform name
              this._platform = "linux";
       }

       /**
        * Returns the Linux os name along with the @see LinuxDistribution type
        *
        * @public
        * @returns {String}
        */
       public getProviderName(): string {
              return `${this.providerName} (${this.getDistribution().split('"').join("")})`;
       }

       /**
        * Returns the current Linux distribution version
        *
        * @public
        * @returns {String}
        */
       public getVersion(): string {
              return version();
       }

       /**
        * Gets the current Linux distribution. e.g Ubuntu, Arch
        *
        * @public
        * @returns {LinuxDistribution}
        */
       public getDistribution(): LinuxDistribution {
              const releasePath: string = "/etc/os-release";

              const data: string = readFileSync(releasePath, {
                     encoding: "utf-8",
              });
              // get each line and '=' delimiters
              const lines: Array<string> = data.split("\n");

              const length: number = lines.length;
              let index: number = 0;

              for (; index < length; index++) {
                     const line: string = lines[index];
                     const keyPair: Array<string> = line.split("=");

                     const key: string = keyPair[0];
                     const value: string = keyPair[1];

                     if (key === "NAME" && value) {
                            return value;
                     }
              }

              return "";
       }

       /**
        * Using the Linux 'which' command, this searches the current system for the specified file, executable or variable depending on the provided scope
        *
        *
        * @public
        * @param {SystemSearchOptions} options
        * @returns {Promise<CollectionMap<string>>}
        */
       public async whereIs(
              options: SystemSearchOptions,
       ): Promise<CollectionMap<string>> {
              const paths: CollectionMap<string> = await whereIs(this, options);
              // return the first result
              return Promise.resolve(paths);
       }

       /**
        * Installs the specified @see SystemModule optionally providing an installation provider
        *
        * @public
        * @param {SystemModule} module
        * @returns {Promise<Boolean>}
        */
       public install(module: SystemModule): Promise<boolean> {
              return new Promise((resolve, _) => {
                     resolve(false);
              });
       }

       /**
        * Performs the default update procedure on the current operating system
        *
        * @public
        * @returns {Promise<Boolean>}
        */
       public update(): Promise<boolean> {
              return new Promise((resolve, _) => {
                     resolve(false);
              });
       }

       /**
        * Executes a system-level command
        *
        * @public
        * @param {String} command
        * @param {Array<String>} flags
        * @returns {Promise<Buffer>}
        */
       public async execute(
              command: string,
              flags?: Array<string>,
       ): Promise<Buffer> {
              const commandString: string = buildCommandString(command, flags);
              // reference abstracted executable handler
              return await this.createExecutableStream(commandString);
       }

       /**
        * Terminates the specified process by name or id with the defined @see NodeJS.Signals
        *
        * @public
        * @param {String | Number} processOrId
        * @param {NodeJS.Signals} signal
        * @returns {Promise<Buffer>}
        */
       public kill(
              processOrId: string | number,
              signal?: NodeJS.Signals,
       ): Promise<Buffer> {
              let command: string = null;
              let argument: Array<string> = [];

              if (typeof processOrId === "number") {
                     command = LINUX_EXEC_KILL;
                     argument = [`-9 ${processOrId}`];
              } else {
                     command = LINUX_EXEC_PKILL;
                     argument = [`-9 ${processOrId}`];
              }

              return this.execute(command, argument);
       }

       /**
        * Resolves the provided path to ensure compatibility with the default Linux directory system
        *
        * @public
        * @param {String} path
        * @param {Boolean} resolveSpaces
        * @returns {String}
        */
       public resolvePath(path: string, resolveSpaces?: boolean): string {
              return `${path.split("\\").join(sep).trim()}`;
       }

       /**
        * Builds the provided path into an executable command-line string
        *
        * @public
        * @param {String} path
        * @param {ApplicationLaunchOptions} options
        * @returns {String}
        */
       public buildExecutablePath(
              path: string,
              options?: ApplicationLaunchOptions,
       ): string {
              const entryPoint: string = options?.["entryPoint"]
                     ? options?.["entryPoint"] + " "
                     : "";
              return `${entryPoint}${this.resolvePath(path)}`;
       }

       /**
        * Returns the User profile directory configured by the environment variable @see USER_PROFILE_DIRECTORY
        *
        * @public
        * @returns {String}
        */
       public homePath(): string {
              return process.env[LinuxProvider.USER_PROFILE] || homedir();
       }

       /**
        * Returns the list of common application directories for the given @see IOSProvider
        *
        * @public
        * @returns {Array<string>}
        */
       public applicationPaths(): Array<string> {
              return [
                     `${sep}usr${sep}share${sep}applications`,
                     `${sep}usr${sep}share`,
                     `${sep}usr${sep}bin`,
                     `${sep}usr${sep}local`,
                     `${sep}opt`,
                     `${sep}bin`,
              ];
       }
}

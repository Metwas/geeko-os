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
       SYSTEM_ERROR_EVENT,
       SYSTEM_EXECUTE_EVENT,
       SYSTEM_MESSAGE_EVENT,
} from "../constants/global.constants";

import { ApplicationLaunchOptions } from "../../../types/ApplicationLaunchOptions";
import { SystemProcessExecutable } from "../../../types/SystemProcessExecutable";
import { SystemModule } from "../../../types/SystemModule";
import { SystemSearchOptions } from "./SystemSearchOptions";
import { ChildProcess, exec } from "node:child_process";
import { Platform } from "../../../types/Platform";
import { CollectionMap } from "@geeko/core";
import { EventEmitter } from "tseep";
import { version } from "node:os";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Core operating system interface, e.g Linux, Window
 *
 * @public
 */
export interface IOSProvider {
       /**
        * Readonly provider name e.g Linux, Windows
        */
       readonly providerName: string;

       /**
        * Returns the type of operating system. e.g Linux, Windows
        *
        * @public
        * @returns {String}
        */
       getProviderName(): string;

       /**
        * Returns the verion of the current operating system. e.g Linux: Ubuntu 22.04, Windows 10 Pro
        *
        * @public
        * @returns {String}
        */
       getVersion(): string;

       /**
        * System platform identification
        *
        * @public
        * @type {Platform}
        */
       platform(): string;

       /**
        * Searches the current system for the specified file, executable or variable.
        * @see SystemSearchOptions allows for scoping
        *
        * @public
        * @param {SystemSearchOptions} options
        * @returns {Promise<CollectionMap<string> | undefined>}
        */
       whereIs(
              options?: SystemSearchOptions,
       ): Promise<CollectionMap<string> | undefined>;

       /**
        * Installs the specified @see SystemModule optionally providing an installation provider
        *
        * @public
        * @param {SystemModule} module
        * @returns {Promise<Boolean>}
        */
       install(module: SystemModule): Promise<boolean>;

       /**
        * Performs the default update procedure on the current operating system
        *
        * @public
        * @returns {Promise<Boolean>}
        */
       update(): Promise<boolean>;

       /**
        * Executes a system-level command
        *
        * @public
        * @param {String} command
        * @param {Array<String>} flags
        * @returns {Promise<Buffer>}
        */
       execute(command: string, flags?: Array<string>): Promise<Buffer>;

       /**
        * Terminates the specified process by name or id with the defined @see NodeJS.Signals
        *
        * @public
        * @param {String | Number | ChildProcess} processOrId
        * @param {NodeJS.Signals} signal
        * @returns {Promise<Buffer>}
        */
       kill(
              processOrId: string | number | ChildProcess,
              signal?: NodeJS.Signals,
       ): Promise<Buffer>;

       /**
        * Resolves the provided path to ensure compatibility between systems
        *
        * @public
        * @param {String} path
        * @param {Boolean} resolveSpaces
        * @returns {String}
        */
       resolvePath(path: string, resolveSpaces?: boolean): string;

       /**
        * Builds the provided path into an executable command-line string
        *
        * @public
        * @param {String} path
        * @param {ApplicationLaunchOptions} options
        * @returns {String}
        */
       buildExecutablePath(
              path: string,
              options?: ApplicationLaunchOptions,
       ): string;

       /**
        * Builds the provided executable components required for process creation
        *
        * @public
        * @param {String} path
        * @param {ApplicationLaunchOptions} options
        * @returns {SystemProcessExecutable}
        */
       buildExecutable(
              path: string,
              options?: ApplicationLaunchOptions,
       ): SystemProcessExecutable;

       /**
        * Executable flag builder
        *
        * @public
        * @param {Array<String>} flags
        * @returns {Array<String>}
        */
       buildExecutableFlags(flags: Array<string>): Array<string>;

       /**
        * Returns the home or user profile directory for the given @see IOSProvider
        *
        * @public
        * @returns {String}
        */
       homePath(): string;

       /**
        * Returns the list of common application directories for the given @see IOSProvider
        *
        * @public
        * @returns {Array<string>}
        */
       applicationPaths(): Array<string>;
}

/**
 * Core operating system defaults, e.g Linux, Window
 *
 * @public
 */
export abstract class CoreOSProvider
       extends EventEmitter
       implements IOSProvider
{
       /**
        * Constructs this os provider with the specified provider name
        *
        * @public
        * @param {String} providerName
        */
       public constructor(public readonly providerName: string) {
              super();
              // call custom name resolver
              this.providerName = this.resolveProvider(providerName);
       }

       /**
        * Returns the type of operating system. e.g Linux, Windows
        *
        * @public
        * @returns {String}
        */
       public abstract getProviderName(): string;

       /**
        * System platform identification
        *
        * @protected
        * @type {Platform}
        */
       protected _platform: Platform = "";

       /**
        * System platform identification
        *
        * @public
        * @type {Platform}
        */
       public platform(): Platform {
              return this._platform;
       }

       /**
        * Returns the verion of the current operating system. e.g Linux: Ubuntu 22.04, Windows 10 Pro
        *
        * @public
        * @returns {String}
        */
       public getVersion(): string {
              return version();
       }

       /**
        * Installs the specified @see SystemModule optionally providing an installation provider
        *
        * @public
        * @param {SystemModule} module
        * @returns {Promise<Boolean>}
        */
       public abstract install(module: SystemModule): Promise<boolean>;

       /**
        * Performs the default update procedure on the current operating system
        *
        * @public
        * @returns {Promise<Boolean>}
        */
       public abstract update(): Promise<boolean>;

       /**
        * Searches the current system for the specified file, executable or variable.
        * @see SystemSearchOptions allows for scoping
        *
        * @public
        * @param {SystemSearchOptions} options
        * @returns {Promise<CollectionMap<string> | undefined>}
        */
       public abstract whereIs(
              options?: SystemSearchOptions,
       ): Promise<CollectionMap<string> | undefined>;

       /**
        * Executes a system-level command
        *
        * @public
        * @param {String} command
        * @param {Array<String>} flags
        * @returns {Promise<Buffer>}
        */
       public abstract execute(
              command: string,
              flags?: Array<string>,
       ): Promise<Buffer>;

       /**
        * Creates a awaitable @see ChildProcess stream
        *
        * @protected
        * @param {String} command
        * @returns {Promise<Buffer>}
        */
       protected createExecutableStream(command: string): Promise<Buffer> {
              return new Promise((resolve, reject) => {
                     const spawn: ChildProcess = exec(command);
                     const buffer: Array<any> = [];

                     this.emit(SYSTEM_EXECUTE_EVENT, {
                            processId: spawn.pid,
                            parentId: process.pid,
                            command,
                     });

                     spawn.on("message", (message: any) => {
                            buffer.push(message);
                            this.emit(SYSTEM_MESSAGE_EVENT, message);
                     });

                     spawn.on("error", (error: Error) => {
                            this.emit(SYSTEM_ERROR_EVENT, {
                                   message: error.message,
                            });
                     });

                     spawn.on("close", () => {
                            resolve(Buffer.from(buffer));
                     });
              });
       }

       /**
        * Terminates the specified process by name or id with the defined @see NodeJS.Signals
        *
        * @public
        * @param {String | Number | ChildProcess} processOrId
        * @param {NodeJS.Signals} signal
        * @returns {Promise<Buffer>}
        */
       public abstract kill(
              processOrId: string | number | ChildProcess,
              signal?: NodeJS.Signals,
       ): Promise<Buffer>;

       /**
        * Custom os provider name resolver
        *
        * @public
        * @param {String} providerName
        * @returns {String}
        */
       public resolveProvider(providerName: string): string {
              return providerName;
       }

       /**
        * Resolves the provided path to ensure compatibility between systems
        *
        * @public
        * @param {String} path
        * @returns {String}
        */
       public resolvePath(path: string): string {
              return path;
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
              return path;
       }

       /**
        * Builds the provided executable components required for process creation
        *
        * @public
        * @param {String} path
        * @param {ApplicationLaunchOptions} options
        * @returns {SystemProcessExecutable}
        */
       public buildExecutable(
              path: string,
              options?: ApplicationLaunchOptions,
       ): SystemProcessExecutable {
              return {
                     executablePath: this.buildExecutablePath(path, options),
                     arguments: this.buildExecutableFlags(options?.flags),
                     filePath: path,
                     options: {},
              };
       }

       /**
        * Executable flag builder
        *
        * @public
        * @param {Array<String>} flags
        * @returns {Array<String>}
        */
       public buildExecutableFlags(flags?: Array<string>): Array<string> {
              const normalized: Array<string | undefined> = Array.isArray(flags)
                     ? flags
                     : [flags];
              const length: number = normalized.length;
              let index: number = 0;

              let validated: Array<string> = [];

              for (; index < length; index++) {
                     const flag: string | undefined = normalized[index];

                     /** Validate flag string */
                     if (
                            typeof flag === "string" &&
                            this.validateFlagString(flag) === true
                     ) {
                            validated.push(flag);
                     }
              }

              return validated;
       }

       /**
        * Flag validation helper
        *
        * @protected
        * @param {String} flag
        * @returns {Boolean}
        */
       protected validateFlagString(flag: string): boolean {
              return typeof flag === "string";
       }

       /**
        * Returns the home or user profile directory for the given @see IOSProvider
        *
        * @public
        * @returns {String}
        */
       public abstract homePath(): string;

       /**
        * Returns the list of common application directories for the given @see IOSProvider
        *
        * @public
        * @returns {Array<string>}
        */
       public abstract applicationPaths(): Array<string>;
}

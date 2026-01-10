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

import { ApplicationLaunchOptions } from "../../../types/ApplicationLaunchOptions";
import { SystemProcessExecutable } from "../../../types/SystemProcessExecutable";
import { WINDOWS_TASK_TERMINATE } from "../constants/windows.constants";
import { SystemSearchOptions } from "../interfaces/SystemSearchOptions";
import { SystemModule } from "../../../types/SystemModule";
import { buildCommandString } from "../tools/terminal";
import { homedir, platform, version } from "node:os";
import { CoreOSProvider } from "../interfaces/os";
import { ChildProcess } from "node:child_process";
import { whereIs } from "../tools/windows.scan";
import { CollectionMap } from "@geeko/core";
import { resolvePath } from "../tools/path";
import { sep } from "node:path";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Linux specific operating system interface
 *
 * @public
 */
export class WindowsProvider extends CoreOSProvider {
       /**
        * Global Windows user profile environment variable definition
        *
        * @public
        * @type {String}
        */
       public static USER_PROFILE: string = "USERPROFILE";

       /**
        * Global Windows Program files (x86) on the root directory
        *
        * @public
        * @type {String}
        */
       public static PROGRAM_FILESX86: string = "C:\\PROGRAM FILES (x86)";

       /**
        * Global Windows Program files on the root directory
        *
        * @public
        * @type {String}
        */
       public static PROGRAM_FILES: string = "C:\\PROGRAM FILES";

       /**
        * Default constructor
        *
        * @public
        */
       public constructor() {
              super(platform());
              // set common platform name
              this._platform = "windows";
       }

       /**
        * Returns the Linux os name along with the @see LinuxDistribution type
        *
        * @public
        * @returns {String}
        */
       public getProviderName(): string {
              return this.providerName;
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
        * Using the default 'where' command, this searches the current system for the specified file, executable or variable depending on the provided scope
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
              return new Promise((resolve, reject) => {
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
              return new Promise((resolve, reject) => {
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
        * @param {String | Number | ChildProcess} processOrId
        * @param {NodeJS.Signals} signal
        * @returns {Promise<Buffer>}
        */
       public kill(
              processOrId: string | number | ChildProcess,
       ): Promise<Buffer> {
              return this.execute(WINDOWS_TASK_TERMINATE, [
                     "/pid",
                     String(
                            typeof processOrId["pid"] === "number"
                                   ? processOrId["pid"]
                                   : processOrId,
                     ),
                     "/f",
                     "/t",
              ]);
       }

       /**
        * Resolves the default nodejs platform of 'win32' to 'Windows'
        *
        * @public
        * @param {String} providerName
        * @returns {String}
        */
       public resolveProvider(providerName: string): string {
              return providerName === "win32" ? "Windows" : providerName;
       }

       /**
        * Resolves the provided path to ensure compatibility with the default Windows directory system
        *
        * @public
        * @param {String} path
        * @param {Boolean} resolveSpaces
        * @returns {String}
        */
       public resolvePath(path: string, resolveSpaces: boolean = true): string {
              return resolvePath(`${path.split("/").join(sep)}`, resolveSpaces);
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
              return `${entryPoint}\"${this.resolvePath(path, false)}\" ${(options?.["flags"] || []).join(" ")}`;
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
                     arguments: this.buildExecutableFlags(options?.["flags"]),
                     filePath: path,
                     options: {
                            detached: options?.["detached"] || false,
                            shell: true,
                     },
              };
       }

       /**
        * Returns the User profile directory configured by the environment variable @see USER_PROFILE_DIRECTORY
        *
        * @public
        * @returns {String}
        */
       public homePath(): string {
              return process.env[WindowsProvider.USER_PROFILE] || homedir();
       }

       /**
        * Returns the list of common application directories for the given @see IOSProvider
        *
        * @public
        * @returns {Array<string>}
        */
       public applicationPaths(): Array<string> {
              return [
                     `${this.homePath()}${sep}AppData${sep}Local${sep}Programs`, // Local appdata user programs
                     `${WindowsProvider.PROGRAM_FILESX86}`,
                     `${WindowsProvider.PROGRAM_FILES}`,
              ];
       }
}

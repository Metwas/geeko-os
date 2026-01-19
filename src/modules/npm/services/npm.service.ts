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
       NPM_CLI_COMMAND,
       NPM_ERROR_CHANNEL,
       NPM_MESSAGE_CHANNEL,
} from "../../../global/npm.events";

import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { HTTPS_GET_ASYNC, HTTPS_GET_ASYNC_STREAM } from "../tools/http";
import { dirname, isAbsolute, resolve } from "node:path";
import { ChildProcess, spawn } from "node:child_process";
import { ModuleReport } from "../ModuleReport";
import { ModuleToken } from "../ModuleToken";
import { PromiseToken } from "@geeko/tasks";
import { randomUUID } from "node:crypto";
import { NpmModule } from "../NpmModule";
import { LogService } from "@geeko/log";
import { EventEmitter } from "tseep";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Application Npm service API
 *
 * @public
 */
export class NpmService extends EventEmitter {
       /**
        * Max timout for installing a given package (1 minute)
        *
        * @public
        * @type {Number}
        */
       public static MAX_TIMEOUT: number = 1000 * 60 * 1;

       /**
        * Npm module installion check delay (in milliseconds)
        *
        * @public
        * @type {Number}
        */
       public static SCHEDULE_CHECKS_DELAY: number = 100;

       /**
        * Default constructor
        *
        * @public
        * @param {LogService} logger
        */
       public constructor(private logger?: LogService) {
              super();
       }

       /**
        * Package install queue
        *
        * @private
        * @type {Array<ModuleToken<ModuleReport>>}
        */
       private _queue: Array<ModuleToken<ModuleReport>> = [];

       /**
        * Installation ready state flag
        *
        * @private
        * @type {Boolean}
        */
       private _busy: boolean = false;

       /**
        * Check timer reference
        *
        * @private
        * @type {Number}
        */
       private _timer: any = -1;

       /**
        * Begins the installation process of the specified @see NpmModule
        *
        * @note Multiple calls to this function will queue the specified install module
        *
        * @public
        * @param {NpmModule} module
        * @returns {Promise<ModuleReport>}
        */
       public install(module: NpmModule): Promise<ModuleReport | void> {
              if (!module?.name) {
                     return Promise.resolve(void 0);
              }

              const token: PromiseToken<ModuleReport> =
                     new PromiseToken<ModuleReport>();
              // add module to queue
              this._enqueue({
                     id: this._createTokenId(module),
                     module: module,
                     promise: token,
              });

              if (this.logger) {
                     this.logger.info(
                            `Module ${module["name"]} queued for installation`,
                     );
              }

              if (!this.isBusy()) {
                     this._runChecks();
              }

              return token.promise();
       }

       /**
        * Gets all versions available for the specified @see NpmModule
        *
        * @public
        * @param {NpmModule} module
        * @returns {Promise<Array<String>>}
        */
       public async getPackageVersions(
              module: NpmModule,
       ): Promise<Array<string> | void> {
              return await getNPMPackageVersions(module);
       }

       /**
        * Begins an Npm update sequence within the current node context
        * Optionally provide an @see NpmModule, if omitted, this will update all packages
        *
        * @public
        * @param {NpmModule | null} module
        * @returns {Promise<ModuleReport>}
        */
       public update(module?: NpmModule): Promise<ModuleReport | void> {
              return this.install(
                     module
                            ? module
                            : {
                                     name: "update",
                              },
              );
       }

       /**
        * Validates if the specified module is already installed
        *
        * @public
        * @param {NpmModule} module
        * @returns {Boolean}
        */
       public hasDependancy(module: NpmModule): boolean {
              return true;
       }

       /**
        * Gets the current installation operation state
        *
        * @public
        * @returns {Boolean}
        */
       public isBusy(): boolean {
              return this._busy;
       }

       /**
        * Validates the provided @see NpmModule
        *
        * @public
        * @param {NpmModule} module
        * @returns {Boolean}
        */
       public isValid(module: NpmModule): boolean {
              return typeof (module || {})["name"] === "string";
       }

       /**
        * Validates the provided @see NpmModule
        *
        * @public
        * @param {NpmModule} module
        * @returns {Boolean}
        */
       private _createExecutableArguments(module: NpmModule): Array<string> {
              const name: string = module["name"];
              const global: boolean = module["global"] ?? false;
              const development: boolean = module["development"] ?? false;
              const version: string = module["version"] ?? "";

              let command: Array<string> = [];

              if (name === "update") {
                     command.push(name);
                     command.push("--save");
              } else {
                     command.push(
                            `install ${name}${version ? ":" + version : ""}`,
                     );

                     if (global === true) {
                            command.push("-g");
                     } else if (development) {
                            command.push("--save-dev");
                     } else {
                            command.push("--save");
                     }
              }

              return command;
       }

       /**
        * @see NpmModule installation helper which generates the @see ModuleReport onced completed/failed
        *
        * @public
        * @param {NpmModule} module
        * @returns {Promise<ModuleReport>}
        */
       private async _install(module: NpmModule): Promise<ModuleReport> {
              const code: boolean = await (module.tarPath
                     ? this._downloadTarball(module)
                     : this._systemInstall(
                              this._createExecutableArguments(module),
                       ));
              // validate installation via the return codes & if any errors
              return Promise.resolve({ module: module, installed: code });
       }

       /**
        * @see NpmModule queue helper
        *
        * @public
        * @param {NpmModule} module
        */
       private _enqueue(token: ModuleToken<ModuleReport>): void {
              this._queue.push(token);
       }

       /**
        * @see NpmModule dequeue helper
        *
        * @public
        * @returns {NpmModule}
        */
       private _dequeue(): ModuleToken<ModuleReport> | undefined {
              return this._queue.pop();
       }

       /**
        * Runs a timer periodically checking for @see NpmModule packages to install
        *
        * @private
        * @param {Number} delay
        * @returns {Promise<void>}
        */
       private async _runChecks(
              delay: number = NpmService.SCHEDULE_CHECKS_DELAY,
       ): Promise<void> {
              if (this._queue.length === 0) {
                     this._busy = false;
                     return;
              }

              clearTimeout(this._timer);
              this._busy = true;

              const token: ModuleToken<ModuleReport> | undefined =
                     this._dequeue();

              const promise: PromiseToken<ModuleReport> | undefined =
                     token?.promise;

              const module: NpmModule | undefined = token?.module;

              if (promise && token?.id && module && this.isValid(module)) {
                     if (this.logger) {
                            this.logger.info(
                                   `[NPM] module ${module["name"]} Installing, token Id: ${token?.id}`,
                            );
                     }

                     const report: ModuleReport = await this._install(module);

                     if (this.logger) {
                            if (report["installed"]) {
                                   this.logger.info(
                                          `Module ${module["name"]} Installed`,
                                   );
                            } else {
                                   this.logger.error(
                                          `Module ${module["name"]} Failed`,
                                   );
                            }
                     }

                     promise.resolve(report);
              }

              this._timer = setTimeout(
                     this._runChecks.bind(this),
                     delay,
                     delay,
              );
       }

       /**
        * @see ModuleToken unique identifier creation helper
        *
        * @private
        * @param {NpmModule} module
        * @returns {String}
        */
       private _createTokenId(module: NpmModule): string {
              return randomUUID();
       }

       /**
        * NPM tarball download helper function
        *
        * @private
        * @param {NpmModule} module
        * @returns {Promise<Boolean>}
        */
       private async _downloadTarball(module: NpmModule): Promise<boolean> {
              let filePath: string | undefined = void 0;

              try {
                     const tarball: string | void =
                            await getNPMPackageURL(module);

                     if (typeof tarball !== "string") {
                            if (this.logger) {
                                   this.logger.error(
                                          `[NPM] Unable to located tarball URL for module [${module.name}] version [${module.version}]`,
                                   );
                            }

                            return false;
                     }

                     if (module.tarPath && isAbsolute(module.tarPath)) {
                            filePath = module.tarPath;
                     } else if (module.tarPath) {
                            filePath = resolve(
                                   __dirname,
                                   "../../../../",
                                   module.tarPath,
                            );
                     }

                     if (!filePath) {
                            this.logger?.error(
                                   `[NPM] Invalid file path was provided`,
                            );

                            return false;
                     }

                     const directory: string = dirname(filePath);

                     if (!existsSync(directory)) {
                            mkdirSync(directory, { recursive: true });
                     }

                     module.installedPath = filePath;

                     if (this.logger) {
                            this.logger.verbose(
                                   "[NPM] Downloading: " + filePath,
                            );
                     }

                     return await HTTPS_GET_ASYNC_STREAM(
                            tarball,
                            createWriteStream(filePath),
                     );
              } catch (error) {
                     this.logger?.error(
                            `[NPM] ${typeof error === "string" ? error : (error as any)?.message}`,
                     );

                     /** Remove file on error if defined */
                     filePath && unlinkSync(filePath);
                     return false;
              }
       }

       /**
        * Installs the npm packages via the CLI API
        *
        * @public
        * @param {Array<string>} flags
        * @returns {Promise<Number>}
        */
       private _systemInstall(flags: Array<string>): Promise<boolean> {
              return new Promise((resolve, reject) => {
                     const _process: ChildProcess = spawn(
                            NPM_CLI_COMMAND,
                            flags,
                            {
                                   shell: process.platform === "win32",
                            },
                     );

                     let buffer: Array<string> | undefined = [];

                     const onClose: any = (code: number) => {
                            const valid: boolean = code === 0;

                            this.emit(
                                   valid
                                          ? NPM_MESSAGE_CHANNEL
                                          : NPM_ERROR_CHANNEL,
                                   {
                                          message:
                                                 buffer &&
                                                 Buffer.from(
                                                        buffer.join(""),
                                                 ).toString(),
                                   },
                            );

                            resolve(valid);
                     };

                     _process.on("exit", onClose);

                     if (_process.stderr) {
                            // reject on any std error outputs
                            _process.stderr.on("data", (data: string) => {
                                   _process.kill();
                                   buffer = void 0;
                                   resolve(false);
                            });
                     }

                     if (_process.stdout) {
                            _process.stdout.on("data", (data: string) => {
                                   buffer?.push(data);
                            });
                     }
              });
       }
}

/**
 * NPM package tarball url helper function
 *
 * @public
 * @param {NpmModule} module
 * @returns {Promise<String>}
 */
export const getNPMPackageURL = async (
       module: NpmModule,
): Promise<string | void> => {
       try {
              const version: string = module.version ?? "latest";
              const metadataURL: string = `https://registry.npmjs.org/${module.name}${version ? "/" + version : ""}`;
              const buffer: string = await HTTPS_GET_ASYNC(metadataURL);

              if (typeof buffer !== "string") {
                     return void 0;
              }

              const metadata: any = JSON.parse(buffer);

              if (version === "latest") {
                     module.version = metadata.version;
              }

              /** return tarball package url */
              return metadata?.dist?.tarball;
       } catch (error) {
              return void 0;
       }
};

/**
 * NPM package version list helper
 *
 * @public
 * @param {NpmModule} module
 * @returns {Promise<Array<String>>}
 */
export const getNPMPackageVersions = async (
       module: NpmModule,
): Promise<Array<string> | void> => {
       try {
              const metadataURL: string = `https://registry.npmjs.org/${module.name}`;
              const buffer: string = await HTTPS_GET_ASYNC(metadataURL);

              if (typeof buffer !== "string") {
                     return void 0;
              }

              const metadata: any = JSON.parse(buffer);

              if (metadata?.versions) {
                     const keys: Array<string> = Object.keys(metadata.versions);

                     if (Array.isArray(keys) && keys.length > 0) {
                            return keys;
                     }
              }

              return void 0;
       } catch (error) {
              return void 0;
       }
};

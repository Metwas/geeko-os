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
       PROCESS_MESSAGE_CHANNEL,
       PROCESS_CLOSE_CHANNEL,
       PROCESS_ERROR_CHANNEL,
} from "../../../global/application.constants";

import {
       SpawnOptionsWithoutStdio,
       ChildProcess,
       spawn,
} from "node:child_process";

import { SystemProcessExecutable } from "../../../types/SystemProcessExecutable";
import { LogService } from "@geeko/log";
import { EventEmitter } from "tseep";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Application process maangement interface
 *
 * @public
 */
export interface IApplicationProcess {
       /**
        * Application process identifier
        *
        * @public
        * @type {Number}
        */
       pid(): number | undefined;

       /**
        * Optional application name, otherwise returns the processId
        *
        * @type {String}
        */
       applicationName(): string;

       /**
        * Parent process identifier
        *
        * @public
        * @type {Number}
        */
       ppid(): number | undefined;

       /**
        * Process spawn file
        *
        * @public
        * @type {String}
        */
       execPath(): string;
}

/**
 * Application process maangement class
 *
 * @public
 */
export class ApplicationProcess
       extends EventEmitter
       implements IApplicationProcess
{
       /**
        * Underlying @see ChildProcess execute function
        *
        * @public
        * @type {Function}
        */
       public static readonly PROCESS_SPAWN_FN = spawn;

       /**
        * Creates an instance of @see ApplicationProcess from the provided @see SystemProcessExecutable
        *
        * @public
        * @param {SystemProcessExecutable} executable
        * @param {Object} options
        * @returns {ApplicationProcess}
        */
       public static create = (
              executable: SystemProcessExecutable,
              options?: { name?: string; logger?: LogService },
       ): ApplicationProcess => {
              const flags: Array<string> | undefined = executable.arguments;
              const command: string = executable.executablePath;
              const processOptions: SpawnOptionsWithoutStdio | undefined =
                     executable.options;

              return new ApplicationProcess(
                     ApplicationProcess.PROCESS_SPAWN_FN(
                            command,
                            flags,
                            processOptions,
                     ),
                     options,
              );
       };

       /**
        * Creates a new process wrapper instance from the provided spawned process
        *
        * @public
        * @param {ChildProcess} childProcess
        * @param {Object} options
        */
       public constructor(
              private readonly childProcess: ChildProcess,
              options?: { name?: string; logger?: LogService },
       ) {
              super();

              if (typeof options?.["name"] === "string") {
                     this._name = options["name"];
              }

              this._logger = options?.logger;
              // attach process event channels
              this._bindProcessEvents();
       }

       /**
        * Gets the configuration application name
        *
        * @public
        * @type {Number}
        */
       private _name: string = "";
       public applicationName(): string {
              return `${this._name || ""}( ${this.pid()} )`;
       }

       /**
        * Gets the process identifier
        *
        * @public
        * @type {Number}
        */
       public pid(): number | undefined {
              return this.childProcess.pid;
       }

       /**
        *
        * @returns
        */
       public ppid(): number | undefined {
              return this.childProcess.pid;
       }

       /**
        * Process spawn file
        *
        * @public
        * @type {String}
        */
       public execPath(): string {
              return this.childProcess.spawnfile;
       }

       /**
        * Sends the specified signal code to the terminate the underlying @see this._process
        *
        * @public
        * @param {String} message
        * @returns {Boolean}
        */
       public send(message: string): boolean {
              return this.childProcess.send(message);
       }

       /**
        * Sets the logger reference for this process wrapper
        *
        * @public
        * @param {LogService} logger
        */
       private _logger: LogService | undefined = void 0;

       /**
        * @see ChildProcess event bind helper
        *
        * @private
        */
       private _bindProcessEvents(): void {
              this.childProcess.on("spawn", () => {
                     this.dbg(`Process Started: ${this.applicationName()}`);
              });

              this.childProcess.on("message", (data: Buffer) => {
                     const message: string = data.toString("utf-8");
                     this.dbg(
                            `Process: ${this.applicationName()} sent: ${message}`,
                     );

                     this.emit(PROCESS_MESSAGE_CHANNEL, {
                            message: message,
                     });
              });

              this.childProcess.on("exit", () => {
                     this.dbg(`Process: ${this.applicationName()} closed`);
                     this.emit(PROCESS_CLOSE_CHANNEL, {
                            processId: this.pid(),
                     });
              });

              this.childProcess.on("error", (error: string) => {
                     this.dbgError(
                            `Process: ${this.applicationName()} had an error: ${error}`,
                     );
                     this.emit(PROCESS_ERROR_CHANNEL, {
                            message: error,
                     });
              });
       }

       /**
        * Closes the underlying @see ChildProcess emitting the @see PROCESS_CLOSE_EVENT
        *
        * @public
        * @param {NodeJS.Signals} signal
        */
       public close(signal: NodeJS.Signals = "SIGKILL"): void {
              if (this.childProcess && this.childProcess.killed === false) {
                     this.childProcess.kill(signal);
                     const ppid: number | undefined = this.ppid();

                     if (ppid) {
                            process.kill(ppid, signal);
                     }
              }
       }

       /**
        * Local info debugger
        *
        * @public
        * @param {String} message
        */
       private dbg(message: string): void {
              if (this._logger) {
                     this._logger.info(message);
              }
       }

       /**
        * Local error debugger
        *
        * @public
        * @param {String | Error} message
        */
       private dbgError(message: string | Error): void {
              if (this._logger) {
                     this._logger.error(message);
              }
       }
}

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

import { PROCESS_CLOSE_CHANNEL, PROCESS_ERROR_CHANNEL, PROCESS_MESSAGE_CHANNEL } from "../global/application.constants";
import { SystemProcessExecutable } from "../../../types/SystemProcessExecutable";
import { ChildProcess, spawn } from "node:child_process";
import { LogService } from "@geeko/log";
import { EventEmitter } from "tseep";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Application process maangement interface
 * 
 * @public 
 */
export interface IApplicationProcess
{
       /**
        * Application process identifier
        * 
        * @public
        * @type {Number}
        */
       pid(): number;

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
export class ApplicationProcess extends EventEmitter implements IApplicationProcess
{
       /**
        * Underlying @see ChildProcess execute function
        * 
        * @public
        * @type {():ChildProcess}
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
       public static create = ( executable: SystemProcessExecutable, options?: { name?: string, logger?: LogService } ): ApplicationProcess =>
       {
              const command: string = executable[ "executablePath" ];
              const flags: Array<string> = executable[ "arguments" ];
              const processOptions: any = executable[ "options" ];

              return new ApplicationProcess( ApplicationProcess.PROCESS_SPAWN_FN( command, flags, processOptions ), options );
       };

       /**
        * Creates a new process wrapper instance from the provided spawned process
        * 
        * @public
        * @param {ChildProcess} childProcess
        * @param {Object} options
        */
       public constructor( private readonly childProcess: ChildProcess, options?: { name?: string, logger?: LogService } )
       {
              super();

              if ( typeof options?.[ "name" ] === "string" )
              {
                     this._name = options[ "name" ];
              }

              this.setLogger( options?.[ "logger" ] );
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
       public applicationName(): string
       {
              return `${this._name || ""}( ${this.pid()} )`;
       }

       /**
        * Gets the process identifier
        * 
        * @public
        * @type {Number}
        */
       public pid(): number
       {
              return this.childProcess.pid;
       }

       /**
        * 
        * @returns 
        */
       public ppid(): number | undefined
       {
              return this.childProcess[ "ppid" ];
       }

       /**
        * Process spawn file
        * 
        * @public
        * @type {String}
        */
       public execPath(): string
       {
              return this.childProcess.spawnfile;
       }

       /**
        * Sends the specified signal code to the terminate the underlying @see this._process
        * 
        * @public
        * @param {String} message
        * @returns {Boolean}
        */
       public send( message: string ): boolean
       {
              return this.childProcess.send( message );
       }

       /**
        * Sets the logger reference for this process wrapper
        * 
        * @public
        * @param {LogService} logger 
        */
       private _logger: LogService = null;
       public setLogger( logger: LogService ): void
       {
              if ( logger )
              {
                     this._logger = logger;
              }
       }

       /**
        * @see ChildProcess event bind helper
        * 
        * @private
        */
       private _bindProcessEvents(): void
       {
              this.childProcess.on( "spawn", () =>
              {
                     this.dbg( `Process Started: ${this.applicationName()}` );
              } );

              this.childProcess.on( "message", ( data: Buffer ) =>
              {
                     const message: string = data.toString( "utf-8" );
                     this.dbg( `Process: ${this.applicationName()} sent: ${message}` );

                     this.emit( PROCESS_MESSAGE_CHANNEL, {
                            message: message
                     } );
              } );

              this.childProcess.on( "exit", () =>
              {
                     this.dbg( `Process: ${this.applicationName()} closed` );
                     this.emit( PROCESS_CLOSE_CHANNEL, {
                            processId: this.pid()
                     } );
              } );

              this.childProcess.on( "error", ( error: string ) =>
              {
                     this.dbgError( `Process: ${this.applicationName()} had an error: ${error}` );
                     this.emit( PROCESS_ERROR_CHANNEL, {
                            message: error
                     } );
              } );
       }

       /**
        * Closes the underlying @see ChildProcess emitting the @see PROCESS_CLOSE_EVENT
        * 
        * @public
        * @param {NodeJS.Signals} signal
        */
       public close( signal: NodeJS.Signals = "SIGKILL" ): void
       {
              if ( this.childProcess && this.childProcess.killed === false )
              {
                     this.childProcess.kill( signal );

                     if ( this.ppid() )
                     {
                            process.kill( this.ppid(), signal );
                     }
              }
       }

       /**
        * Local info debugger
        * 
        * @public
        * @param {String} message 
        */
       private dbg( message: string ): void
       {
              if ( this._logger )
              {
                     this._logger.info( message );
              }
       }

       /**
        * Local error debugger
        * 
        * @public
        * @param {String | Error} message 
        */
       private dbgError( message: string | Error ): void
       {
              if ( this._logger )
              {
                     this._logger.error( message );
              }
       }
}
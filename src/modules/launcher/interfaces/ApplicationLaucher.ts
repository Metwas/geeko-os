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
import { ApplicationLaunchOptions } from "../../../types/ApplicationLaunchOptions";
import { ApplicationSearchResult } from "../../../types/ApplicationSearchResult";
import { SystemProcessExecutable } from "../../../types/SystemProcessExecutable";
import { CoreOSProvider, GLOBAL_SYSTEM_PROVIDER } from "../../system";
import { ApplicationResolver } from "./resolver/ApplicationResolver";
import { getFileNameFromPath } from "../../system/tools/path";
import { ApplicationProcess } from "./ApplicationProcess";
import { LogService } from "@geeko/log";
import { sleep } from "@geeko/tasks";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * @see IOSProvider wrapped application launcher
 * 
 * @public
 */
export class ApplicationLauncher
{
       /**
        * Caching provider @see String type
        * 
        * @Note Set null or empty to disable caching
        * 
        * @public
        * @type {String}
        */
       public static CACHE_PROVIDER_TYPE: string = "file";

       /**
        * Option to allow for multiple application instances simultaneously - defaults to @see false
        * 
        * @public
        * @type {Boolean}
        */
       public static ALLOW_MULTIPLE_INSTANCES: boolean = false;

       /**
        * Create the application laucher with reference to a @see IOSProvider
        * 
        * @public
        * @param {LogService} logger
        * @param {CoreOSProvider} os
        */
       public constructor( logger?: LogService, os?: CoreOSProvider )
       {
              this.system = os ?? GLOBAL_SYSTEM_PROVIDER as CoreOSProvider;
              this.resolver = new ApplicationResolver( this.system, logger );
              this.logger = logger;
       }

       /**
        * Option to close the launched instance on any error events
        * 
        * @public
        * @type {Boolean}
        */
       public closeOnError: boolean = true;

       /**
        * Core system provider interface
        * 
        * @public
        * @private
        */
       protected system: CoreOSProvider = null;

       /**
        * Map of all launched application instances
        * 
        * @protected
        * @type {Map<String, { instance: ApplicationProcess, options: ApplicationLaunchOptions }>}
        */
       protected instances: Map<string, { instance: ApplicationProcess, options: ApplicationLaunchOptions }> = new Map();

       /**
        * Application executable resolver 
        * 
        * @protected
        * @type {ApplicationResolver}
        */
       protected resolver: ApplicationResolver = null;

       /**
        * Setting to enable a @see ApplicationProcess instance limit
        * 
        * @Note value <= 0 will disable the limit check
        * 
        * @public
        * @type {Number}
        */
       public maxInstances: number = 0;

       /**
        * Debugger service provider
        * 
        * @protected
        * @type {LogService}
        */
       protected logger: LogService = null;

       /**
        * Spawns a process from the specified executable file path
        * 
        * @public
        * @param {ApplicationLaunchOptions} options 
        * @returns {Promise<ApplicationProcess>}
        */
       public async launch( options: ApplicationLaunchOptions ): Promise<ApplicationProcess>
       {
              try
              {
                     if ( this.canCreate() === true )
                     {
                            const executable: ApplicationSearchResult = await this.getExecutable( options );

                            if ( !executable?.found )
                            {
                                   return Promise.resolve( null );
                            }

                            this.dbg( `Found: [${executable.application}] at: [${executable.path}]` );

                            if ( options?.exclusive === true )
                            {
                                   await this.closeAll();
                            }

                            const instance: ApplicationProcess = await this.createProcess( executable.path, options );

                            this.bind( instance );
                            this.storeProcess( instance, options );

                            return Promise.resolve( instance );
                     }
              }
              catch ( error )
              {
                     this.dbg( error.message );
                     return null;
              }
       }

       /**
        * Sends a shutdown signal to the specified @see ApplicationProcess instance
        * 
        * @public
        * @param {ApplicationProcess} instance 
        */
       public close( instance: ApplicationProcess ): void
       {
              return instance.close();
       }

       /**
        * Sends a shutdown signal to all the launched @see ApplicationProcess instances
        * 
        * @public
        * @returns {Promise<void>}
        */
       public async closeAll(): Promise<void>
       {
              const promises: Array<Promise<any>> = [];

              for ( let cache of this.instances.values() )
              {
                     const name: string = cache.instance.applicationName();

                     if ( name )
                     {
                            promises.push( this.system.kill( name ) );
                     }

                     /** allow some time for the @see ApplicationProcess instance(s) to close fully */
                     await sleep( 10 );
              }

              await Promise.all( promises );
       }

       /**
        * Clears the application executable path results
        * 
        * @Note This will clear all entries if @see applicationName is omitted
        * 
        * @public
        * @param {String} applicationName
        */
       public clearCache( applicationName?: string ): void
       {
              /** TODO: implement */
              return;
       }

       /**
        * Drops the specified @see ApplicationProcess therefore events are no longer being handled by the @see ApplicationLaucher
        * 
        * @public
        * @param {String} instance 
        */
       public drop( instance: string ): void
       {
              for ( let cache of this.instances.values() )
              {
                     const name: string = cache.instance.applicationName();

                     if ( name === instance )
                     {
                            cache.instance.removeAllListeners();
                            this.instances.delete( instance );
                     }
              }
       }

       /**
        * Drops all stored @see ApplicationProcess therefore events are no longer being handled by the @see ApplicationLaucher
        * 
        * @public
        */
       public dropAll(): void
       {
              for ( let cache of this.instances.values() )
              {
                     try
                     {
                            const name: string = cache.instance.applicationName();
                            cache.instance.removeAllListeners();

                            this.instances.delete( name );
                     }
                     catch ( error ) { }
              }
       }

       /**
        * Binds the provided @see ApplicationProcess to the essential event handlers
        * 
        * @protected
        * @param {ApplicationProcess} instance
        */
       protected bind( instance: ApplicationProcess ): void
       {
              if ( instance )
              {
                     instance.on( PROCESS_CLOSE_CHANNEL, this.onProcessClose.bind( this, instance ) );
                     instance.on( PROCESS_ERROR_CHANNEL, this.onProcessError.bind( this, instance ) );
                     instance.on( PROCESS_MESSAGE_CHANNEL, this.onProcessMessage.bind( this, instance ) );
              }
       }

       /**
        * Stores the provided @see ApplicationProcess
        * 
        * @protected
        * @param {ApplicationProcess} instance
        * @param {ApplicationLaunchOptions} options
        */
       protected storeProcess( instance: ApplicationProcess, options: ApplicationLaunchOptions ): void
       {
              if ( instance )
              {
                     const key: string = instance.applicationName();

                     if ( this.instances.has( key ) === true )
                     {
                            return;
                     }

                     this.instances.set( key, { instance, options } );
              }
       }

       /**
        * Validate if the application can be created
        * 
        * @protected
        * @returns {Boolean}
        */
       protected canCreate(): boolean
       {
              if ( this.maxInstances > 0 && ( this.instances.size >= this.maxInstances ) )
              {
                     return false;
              }

              return true;
       }

       /**
        * Async process spawn helper function
        * 
        * @private
        * @param {String} execPath 
        * @param {ApplicationLaunchOptions} options 
        * @returns {Promise<ApplicationProcess>}
        */
       protected createProcess( execPath: string, options?: ApplicationLaunchOptions ): Promise<ApplicationProcess>
       {
              try
              {
                     const executable: SystemProcessExecutable = this.system.buildExecutable( execPath, options );

                     if ( !executable?.executablePath )
                     {
                            throw new Error( "Invalid executable components was provided" );
                     }

                     return Promise.resolve( ApplicationProcess.create( executable, {
                            logger: this.logger,
                            name: getFileNameFromPath( executable[ "filePath" ] )
                     } ) );
              }
              catch ( error )
              {
                     return Promise.reject( error );
              }
       }

       /**
        * Scans & builds the application executable based on the current systems @see IOSProvider
        * 
        * @protected
        * @param {ApplicationLaunchOptions} options
        * @returns {ApplicationSearchResult}
        */
       protected async getExecutable( options: ApplicationLaunchOptions ): Promise<ApplicationSearchResult>
       {
              return await this.resolver.resolve( options );
       }

       /**
        * Default on process close event handler
        * 
        * @private
        * @param {ApplicationProcess} instance 
        */
       protected onProcessClose( instance: ApplicationProcess ): void
       {
              if ( instance )
              {
                     const existing = this.instances.get( instance.applicationName() );
                     const options: ApplicationLaunchOptions = existing.options;

                     if ( existing && this.removeInstance( instance ) )
                     {
                            this.dbg( `Application: ${instance.applicationName()} closed` );
                            /** TODO: ensure close was not a force close before attempting to restart application */
                            if ( options?.restartOnExit === true )
                            {
                                   if ( instance[ "__timeout__" ] )
                                   {
                                          clearTimeout( instance[ "__timeout__" ] );
                                   }

                                   instance[ "__timeout__" ] = setTimeout( () =>
                                   {
                                          clearTimeout( instance[ "__timeout__" ] );
                                          this.launch( options );
                                   }, 1000 );
                            }
                     }
              }
       }

       /**
        * Default on process error event handler
        * 
        * @private
        * @param {ApplicationProcess} instance 
        */
       protected onProcessError( instance: ApplicationProcess, error: Error | string ): void
       {
              this.dbg( `Application: ${instance.applicationName()} had error: ${error}` );
              // close instance if set
              if ( this.closeOnError === true )
              {
                     instance.close();
              }
       }

       /**
        * Default on process message event handler
        * 
        * @private
        * @param {ApplicationProcess} instance 
        * @param {Buffer | String} message
        */
       protected onProcessMessage( instance: ApplicationProcess, message: any ): void
       {
              this.dbg( `Application: ${instance.applicationName()} sent message: ${message}` );
       }

       /**
        * Removes the specified @see ApplicationProcess from the @see Map instances
        * 
        * @protected
        * @param {ApplicationProcess} instance 
        * @returns {Boolean}
        */
       protected removeInstance( instance: ApplicationProcess ): boolean
       {
              if ( !instance )
              {
                     return false;
              }

              const id: string = instance.applicationName();
              // clear from map
              const deleted: boolean = this.instances.delete( id );

              if ( deleted )
              {
                     instance.removeAllListeners();
              }

              return deleted;
       }

       /**
        * Local debug helper function
        * 
        * @protected
        * @param {Object | String} message 
        */
       protected dbg( message: any ): void
       {
              if ( this.logger )
              {
                     this.logger.debug( message );
              }
       }
}
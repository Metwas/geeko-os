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

import { ApplicationPlatformMap } from "../../../../types/ApplicationPlatformMap";
import { DEFAULT_CHROMIUM_URL, DEFAULT_FLAGS } from "./configuration/flags";
import { CHROME_APPLICATION_MAP } from "./configuration/chromium.map";
import { CHROME_ENV_TOKEN } from "../../global/application.constants";
import { connectRemoteDebugger } from "../../tools/connect";
import { ApplicationLauncher } from "../ApplicationLaucher";
import { ApplicationProcess } from "../ApplicationProcess";
import { CoreOSProvider } from "../../../system";
import { ChromeOptions } from "./chrome.options";
import { LogService } from "@geeko/log";
import { sleep } from "@geeko/tasks";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Chromium based application launcher
 * 
 * @public
 */
export class ChromiumLauncher extends ApplicationLauncher
{
       /**
        * Connects to the remote-debugging protocol opened by a chromium interface
        * 
        * @public
        * @param {{ host?: string, port: number }} options 
        * @returns {Promise<any>} 
        */
       public static async connectDebugger( options: { host?: string, port: number } ): Promise<any>
       {
              return await connectRemoteDebugger( options );
       }

       /**
        * Create the chrome laucher with reference to a @see CoreOSProvider
        * 
        * @public
        * @param {LogService} options
        * @param {CoreOSProvider} os
        */
       public constructor( logger?: LogService, os?: CoreOSProvider )
       {
              super( logger, os );
       }

       /**
        * Chrome application default map
        * 
        * @private
        * @type {ApplicationPlatformMap} 
        */
       private map: ApplicationPlatformMap = CHROME_APPLICATION_MAP;

       /**
        * Remote debugger reference
        * 
        * @public
        * @type {Object}
        */
       public remote: any = null;

       /**
        * Creates a new chrome instance based on the provided @see ChromeOptions
        * 
        * @public
        * @param {ChromeOptions} options 
        * @returns {Promise<ApplicationProcess>}
        */
       public async launch( options?: ChromeOptions ): Promise<ApplicationProcess>
       {
              options = ( options ?? {} ) as any;

              if ( !options.app )
              {
                     options.app = this.map;
              }

              if ( !options.flags )
              {
                     options.flags = [];
              }

              /** Check for chrome path within the @see process.env */
              options.executablePath = options.executablePath || process.env[ CHROME_ENV_TOKEN ];

              if ( options.exclusive === true )
              {
                     await this.closeAll();
                     /** allow some time for the chromium @see ApplicationProcess instance(s) to close fully */
                     await sleep( 100 );
              }

              let enableDebugProtocol: boolean = false;
              /** Enable @see RemoteDebuggingProtocol if specified */
              if ( typeof options.debugPort === "number" )
              {
                     enableDebugProtocol = true;
                     options.flags.push( `--remote-debugging-port=${options.debugPort}` );
              }

              if ( !options.url )
              {
                     options.url = DEFAULT_CHROMIUM_URL;
              }

              options.flags.push( options.url );

              if ( options.kiosk )
              {
                     options.flags.push( "--kiosk" );
              }

              const app: ApplicationProcess = await ApplicationLauncher.prototype.launch.call( this, Object.assign( options, {
                     flags: this.flags( options?.flags )
              } ) );

              if ( app && enableDebugProtocol )
              {
                     this.remote = await ChromiumLauncher.connectDebugger( { port: options.debugPort } );
              }

              return app;
       }

       /**
        * Sets the @see ApplicationPlatformMap for this @see ChromiumLauncher instance
        * 
        * @public
        * @param {ApplicationPlatformMap} map 
        */
       public setPlatformMap( map: ApplicationPlatformMap ): void
       {
              if ( map )
              {
                     this.map = map;
              }
       }

       /**
        * Closes all launched chromium instances defined within the @see ApplicationPlatformMap
        * 
        * @public
        */
       public async closeAll(): Promise<void>
       {
              if ( !this.map )
              {
                     return;
              }

              /** Mark all managed @see ApplicationProcess instances with the force close flag to prevent restarts */
              this.dropAll();

              const keys: Array<string> = Object.keys( this.map );
              const length: number = keys.length;
              let index: number = 0;

              const platform: string = this.system.platform();
              const promises: Array<Promise<any>> = [];

              for ( ; index < length; ++index )
              {
                     const key: string = keys[ index ];
                     const value: any = this.map[ key ];

                     const platformExe: string = value[ platform ];

                     if ( platformExe )
                     {
                            promises.push( this.system.kill( platformExe ) );
                     }
              }

              await Promise.all( promises );
       }

       /**
        * Application flag generation helper
        * 
        * @protected
        * @param {Array<String>} overrides 
        */
       protected flags( overrides: Array<string> ): Array<string>
       {
              const merge: Array<string> = [];

              let length: number = DEFAULT_FLAGS.length;
              let index: number = 0;

              for ( ; index < length; index++ )
              {
                     const defaults: string = DEFAULT_FLAGS[ index ];

                     if ( defaults )
                     {
                            merge.push( defaults );
                     }
              }

              length = overrides?.length;
              index = 0;

              for ( ; index < length; index++ )
              {
                     const override: string = overrides[ index ];

                     if ( override )
                     {
                            merge.push( override );
                     }
              }

              return merge;
       }
}
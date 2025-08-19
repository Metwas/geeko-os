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

import { ApplicationSearchOptions } from "../../../../types/ApplicationSearchOptions";
import { ApplicationLaunchOptions } from "../../../../types/ApplicationLaunchOptions";
import { CoreOSProvider, SearchScope, SystemSearchOptions } from "../../../system";
import { ApplicationSearchResult } from "../../../../types/ApplicationSearchResult";
import { ApplicationPlatformMap } from "../../../../types/ApplicationPlatformMap";
import { SystemOperationOptions } from "../../../../types/SystemOperationOptions";
import { AsyncLock, KEY_RELEASE_EVENT, KeyEventAdaptor } from "@geeko/tasks";
import { ApplicationPathResolver } from "./ApplicationPathResolver";
import { ApplicationName } from "../../../../types/ApplicationName";
import { existsSync, lstatSync } from "node:fs";
import { filename } from "../../../../tools/io";
import { CollectionMap } from "@geeko/core";
import { LogService } from "@geeko/log";
import { EventEmitter } from "tseep";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Application executable resolver
 * 
 * @public
 */
export class ApplicationResolver
{
       /**
        * Expects an @see IOSProvider instance which will resolve application paths
        * 
        * @public
        * @param {CoreOSProvider} systemProvider 
        * @param {LogService} logger
        */
       public constructor( protected systemProvider: CoreOSProvider, private logger?: LogService )
       {
       }

       /**
        * Option to only scan for valid Application paths returned by the @see IOSProvider
        * 
        * @public
        * @type {Boolean}
        */
       public scanOnlyCommonPaths: boolean = true;

       /**
        * Begins to scan & resolve the executable path based on the specified @see ApplicationLaunchOptions
        * 
        * @public
        * @param {ApplicationLaunchOptions} options 
        * @returns {ApplicationSearchResult}
        */
       public async resolve( options: ApplicationLaunchOptions ): Promise<ApplicationSearchResult>
       {
              if ( !options?.app )
              {
                     return;
              }

              /** Validate provided @see executablePath if provided to ensure the application specified exists */
              const hasExisting: boolean = this.isFile( options?.executablePath );

              if ( hasExisting === true )
              {
                     return {
                            application: filename( options.executablePath ),
                            path: options.executablePath,
                            found: true,
                     };
              }

              const name: ApplicationName | ApplicationPlatformMap = options.app;
              const paths: Array<string> = this.getCommonPaths();

              // insert user specified directory
              if ( typeof options.directory === "string" )
              {
                     paths.unshift( options.directory );
              }

              // resolve if specified application map
              if ( typeof name === "object" )
              {
                     return this.resolveMap( name as ApplicationPlatformMap, paths );
              }

              const applicationNames: Array<string> = Array.isArray( name ) ? name : [ name ];
              const length: number = applicationNames.length;
              let index: number = 0;

              for ( ; index < length; index++ )
              {
                     const name: string = applicationNames[ index ];
                     const searchResults: ApplicationSearchResult = await this.find( { name, paths } );

                     // scan for the given application name against the list of common paths
                     if ( searchResults.found === true )
                     {
                            // return first result 
                            return {
                                   path: searchResults.path,
                                   application: name,
                                   found: true,
                            };
                     }
              }
       }

       /**
        * Scans for the given @see ApplicationPlatformMap on the given @see IOSProvider
        * 
        * @protected
        * @param {ApplicationPlatformMap} map 
        * @param {Array<String>} paths 
        * @returns {Promise<String>}
        */
       protected async resolveMap( map: ApplicationPlatformMap, paths: Array<string> ): Promise<ApplicationSearchResult>
       {
              const keys: Array<string> = Object.keys( map || {} );
              const length: number = keys.length;
              let index: number = 0;

              const abortController: AbortController = new AbortController();
              let preferred: ApplicationSearchResult = null;
              let available: Array<any> = [];

              /** @see EventEmitter used as key to release the @see AsyncLock on each scan operation */
              const asyncKey: EventEmitter = new EventEmitter();

              const promises: Array<Promise<any>> = [];
              let highestWeight: number = -1;

              for ( ; index < length; index++ )
              {
                     try
                     {
                            const key: string = keys[ index ];
                            const application: any = map[ key ];

                            const name: string = ApplicationPathResolver.resolveFor( application, {
                                   platform: this.systemProvider.platform()
                            } );

                            if ( typeof name !== "string" )
                            {
                                   continue;
                            }

                            const weight: number = application[ "weight" ];

                            if ( highestWeight < weight )
                            {
                                   highestWeight = weight;
                            }

                            const promise: Promise<ApplicationSearchResult> = new Promise( async ( resolve, _ ) =>
                            {
                                   const asyncLock: AsyncLock<any> = new AsyncLock<any>( [ new KeyEventAdaptor( asyncKey ) ] );
                                   await asyncLock.promise();

                                   resolve( Object.assign( await this.find( { name, paths, abortOptions: { abort: abortController } } ), {
                                          application: application,
                                   } ) );
                            } );

                            promise.then( ( result: ApplicationSearchResult ) =>
                            {
                                   const { application, found } = result;

                                   if ( !found )
                                   {
                                          return;
                                   }

                                   const weight: number = application[ "weight" ];

                                   if ( weight >= highestWeight )
                                   {
                                          abortController.abort();
                                          // preferred application - resolve all other promises and cancel all file scan operations
                                          preferred = result;
                                   }
                                   else
                                   {
                                          available.push( result );
                                   }
                            } );

                            promises.push( promise );
                     }
                     catch ( error ) { }
              }

              asyncKey.emit( KEY_RELEASE_EVENT );
              /** Await all scan operations to complete */
              await Promise.all( promises );

              if ( !preferred )
              {
                     // pick the next best application which is available
                     const length: number = available.length;
                     let index: number = 0;

                     for ( ; index < length; index++ )
                     {
                            const _available: any = available[ index ];

                            if ( !_available )
                            {
                                   continue;
                            }

                            if ( _available[ "application" ]?.[ "weight" ] > ( preferred?.[ "application" ]?.[ "weight" ] || 0 ) )
                            {
                                   preferred = _available;
                            }
                     }
              }

              return this.flattenApplicationResult( preferred );
       }

       /**
        * Finds the specified application name & scoping possible directories @see paths 
        * 
        * @protected
        * @param {ApplicationSearchOptions} options
        * @returns {Promise<ApplicationSearchResult>}
        */
       protected async find( options: ApplicationSearchOptions ): Promise<ApplicationSearchResult>
       {
              const result: ApplicationSearchResult = {
                     application: {},
                     found: false,
                     path: ""
              };

              let { name, paths, extension, abortOptions } = ( options ?? {} );
              let scope: SearchScope = "application";

              if ( typeof name !== "string" )
              {
                     return result;
              }

              paths = Array.isArray( paths ) ? paths : [ paths ];
              const length: number = paths.length;
              let index: number = 0;

              for ( ; index < length; index++ )
              {
                     const directory: string = paths[ index ];
                     /** Begin a @see IOSProvider object scan */
                     const results: CollectionMap<string> = await this.scan( { name, directory, extension, scope }, abortOptions );
                     const executablePaths: Array<string> = results?.[ name ];

                     if ( Array.isArray( executablePaths ) && executablePaths.length > 0 )
                     {
                            return {
                                   found: true,
                                   application: name,
                                   path: executablePaths[ 0 ]
                            };
                     }
              }

              return result;
       }

       /**
        * Calls the @see IOSProvider scan command for the specified application name & possible directories
        * 
        * @protected
        * @param {SystemSearchOptions} searchOptions 
        * @param {SystemOperationOptions} abortOptions
        * @returns {Promise<CollectionMap<String>>}
        */
       protected async scan( searchOptions: SystemSearchOptions, abortOptions?: SystemOperationOptions ): Promise<CollectionMap<string>>
       {
              const { name, directory, extension, scope } = searchOptions;

              this.dbg( `Scanning for: [${name}] in directory: [${directory}]` );
              return await this.systemProvider.whereIs( {
                     abort: abortOptions?.[ "abort" ],
                     extension: extension,
                     directory: directory,
                     scope: scope,
                     name: name
              } );
       }

       /**
        * Checks if the provided @see path is a valid file executable
        * 
        * @protected
        * @param {String} path 
        * @returns {Boolean}
        */
       protected isFile( path: string ): boolean
       {
              try
              {
                     /** Ensure @see path is of a file type */
                     return ( existsSync( path ) === true && lstatSync( path ).isFile() === true );
              }
              catch ( error )
              {
                     return false;
              }
       }

       /**
        * Flattens the @see ApplicationPlatformMap to a string name based on the current @see IOSProvider
        * 
        * @protected
        * @param {ApplicationSearchResult} application 
        * @returns {ApplicationSearchResult}
        */
       protected flattenApplicationResult( application: ApplicationSearchResult ): ApplicationSearchResult
       {
              /** Resolve application name for the given @see IOSProvider */
              const name: string = ApplicationPathResolver.resolveFor( application, {
                     platform: this.systemProvider.platform()
              } );

              return {
                     application: name,
                     found: application[ "found" ],
                     path: application[ "path" ]
              };
       }

       /**
        * Gets the list of common paths defined by the @see IOSProvider
        * 
        * @protected
        * @returns {Array<String>}
        */
       protected getCommonPaths(): Array<string>
       {
              return [ ...this.systemProvider.applicationPaths(), this.systemProvider.homePath() ];
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
import { ErrorRequestHandler, RequestHandler, Router } from "express";
import glob from "glob";
import { OpenAPIObject } from "openapi3-ts";

import attachConvroute from "./middleware/attachConvroute";
import {
    BaseOpenAPIObject,
    ConvrequestHandler,
    ErrorConvrequestHandler,
    IConvroute
} from "./types";
import * as catchAsyncErrors from "./utils/catchAsyncErrors";
import convertPath from "./utils/convertPath";

export default class Convexpress {
    /**
     * Identity method that just returns the convroute passed to it. Convenience
     * function for typing as an IConvroute the default export of a file, so you
     * can write this:
     *
     * ```ts
     * import { Convexpress } from "convexpress";
     *
     * export default Convexpress.convroute({
     *   // ...
     * });
     * ```
     *
     * instead of this:
     *
     * ```ts
     * import { IConvroute } from "convexpress";
     *
     * const convroute: IConvroute = {
     *     // ...
     * };
     * export default convroute;
     * ```
     */
    public static convroute(convroute: IConvroute): IConvroute {
        return convroute;
    }

    private middleware: ConvrequestHandler[] = [];
    private convroutes: IConvroute[] = [];
    private errorHandlers: ErrorConvrequestHandler[] = [];
    private baseOpenAPIObject: BaseOpenAPIObject;

    constructor(options: {
        /**
         * Base OpenAPI Object definition, specifying things such as the OpenAPI
         * version and the title of the API. The definition does NOT contain any
         * operation definition, since operation definitions are specified by
         * their corresponding convroutes.
         */
        baseOpenAPIObject: BaseOpenAPIObject;
    }) {
        this.baseOpenAPIObject = options.baseOpenAPIObject;
    }

    /**
     * Add a middleware to the Convexpress instance. The middleware is shared by
     * all convroutes. It's attached at the express' route level, so it has
     * access to the information about the convroute matching the request it's
     * being invoked on (i.e. inside the middleware `req.convroute` is defined)
     */
    public addMiddleware(middleware: ConvrequestHandler): Convexpress {
        this.middleware.push(middleware);
        return this;
    }

    /**
     * Add an error handler to the Convexpress instance. The error handler is
     * shared by all convroutes. It has access to the information about the
     * convroute matching the request it's being invoked on (i.e. inside the
     * error handler `req.convroute` is defined)
     */
    public addErrorHandler(errorHandler: ErrorConvrequestHandler): Convexpress {
        this.errorHandlers.push(errorHandler);
        return this;
    }

    /** Add a convroute to the Convexpress instance */
    public addConvroute(convroute: IConvroute): Convexpress {
        this.convroutes.push(convroute);
        return this;
    }

    /**
     * Add convroutes defined in the files matching the supplied glob pattern
     * relative to the process current working directory (the glob module is
     * used for matching)
     */
    public loadConvroutesFrom(pattern: string): Convexpress {
        const convroutePaths = glob.sync(pattern, { absolute: true });
        convroutePaths.forEach(convroutePath => {
            const convrouteExport = require(convroutePath);
            const convroute =
                convrouteExport && convrouteExport.default
                    ? convrouteExport.default
                    : convrouteExport;
            this.addConvroute(convroute);
        });
        return this;
    }

    /**
     * Get the OpenAPI object built from the operation definitions provided by
     * the convroutes, and the base definition provided to the Convexpress
     * instance on creation.
     *
     * **Note**: if you generate a definition, then add more convroutes to the
     * Convexpress instance, the generated definition will NOT be updated
     * accordingly
     */
    public generateOpenAPIObject(): OpenAPIObject {
        const definition: OpenAPIObject = {
            ...this.baseOpenAPIObject,
            paths: {}
        };
        for (const convroute of this.convroutes) {
            const openapiPath = convertPath(convroute.path);
            definition.paths[openapiPath] = {
                ...definition.paths[openapiPath],
                [convroute.method]: convroute.operationObject
            };
        }
        return definition;
    }

    /**
     * Get the express router configured to handle all the convroutes added to
     * the Convexpress instance.
     *
     * **Note**: if you generate a router, then add more middleware / error
     * handlers / convroutes to the Convexpress instance, the generated router
     * will NOT be updated accordingly
     */
    public generateRouter(): Router {
        // Note: ConvrequestHandler and ErrorConvrequestHandler are compatible
        // with express RequestHandler and ErrorRequestHandler (respectively).
        // TypeScript however doesn't think so, hence the type assertions below

        const router = Router();

        for (const convroute of this.convroutes) {
            const {
                method,
                path,
                middleware = [],
                errorHandlers = []
            } = convroute;

            router[method](
                path,
                // Middleware attaching the convroute object to the request
                attachConvroute(convroute) as RequestHandler,
                [
                    // Shared middleware
                    ...this.middleware,
                    // Convroute-specific middleware
                    ...middleware
                ].map(catchAsyncErrors.handler) as RequestHandler[],
                // Convroute handler
                catchAsyncErrors.handler(convroute.handler) as RequestHandler,
                [
                    // Convroute-specific error handlers
                    ...errorHandlers,
                    // Shared error handlers
                    ...this.errorHandlers
                ].map(catchAsyncErrors.errorHandler) as ErrorRequestHandler[]
            );
        }

        return router;
    }
}

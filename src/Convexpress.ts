import { ErrorRequestHandler, RequestHandler, Router } from "express";
import glob from "glob";
import { OpenAPIObject } from "openapi3-ts";
import swaggerUi from "swagger-ui-express";

import decorateRequest from "./middleware/decorateRequest";
import {
    BaseOpenAPIObject,
    ConvrequestHandler,
    ErrorConvrequestHandler,
    IConvroute
} from "./types";
import * as catchAsyncErrors from "./utils/catchAsyncErrors";
import convertPath from "./utils/convertPath";

export default class Convexpress {
    private middleware: ConvrequestHandler[] = [];
    private convroutes: IConvroute[] = [];
    private errorHandlers: ErrorConvrequestHandler[] = [];
    private baseOpenAPIObject: BaseOpenAPIObject;
    private apiDocsPath: string | null;

    constructor(options: {
        /**
         * Base [OpenAPI Object](https://git.io/fjOmr) definition, specifying
         * things such as the OpenAPI version and the title of the API. The
         * definition does NOT contain any operation definition, since operation
         * definitions are specified by their corresponding convroutes.
         */
        baseOpenAPIObject: BaseOpenAPIObject;
        /**
         * Base path at which to serve the api docs, consisting of:
         *
         * - the json of the OpenAPI Object, served at
         *   `${apiDocsPath}/openapi.json`
         * - a [swagger-ui](https://git.io/fj3cx) for the OpenAPI Object, served
         *   at `${apiDocsPath}/`
         *
         * Defaults to `/api-docs`. You can disable serving api docs by passing
         * null
         */
        apiDocsPath?: string | null;
    }) {
        this.baseOpenAPIObject = options.baseOpenAPIObject;
        this.apiDocsPath =
            options.apiDocsPath === undefined
                ? "/api-docs"
                : options.apiDocsPath;
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
     * Get the express router configured to handle all the convroutes added to
     * the Convexpress instance.
     *
     * **Note**: if you generate a router, then add more middleware / error
     * handlers / convroutes to the Convexpress instance, the generated router
     * will NOT be updated accordingly
     */
    public generateRouter(): Router {
        const router = Router();
        const openAPIObject = this.generateOpenAPIObject();

        for (const convroute of this.convroutes) {
            this.registerConvroute(router, convroute, openAPIObject);
        }

        this.registerApiDocs(router, openAPIObject);

        return router;
    }

    private generateOpenAPIObject(): OpenAPIObject {
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

    private registerConvroute(
        router: Router,
        convroute: IConvroute,
        openAPIObject: OpenAPIObject
    ): void {
        // Note: ConvrequestHandler and ErrorConvrequestHandler are compatible
        // with express RequestHandler and ErrorRequestHandler (respectively).
        // TypeScript however doesn't think so, hence the type assertions below

        const { method, path, middleware = [], errorHandlers = [] } = convroute;

        router[method](
            path,
            // Middleware attaching the convroute and the openAPIObject
            // properties to the request object
            decorateRequest(convroute, openAPIObject) as RequestHandler,
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

    private registerApiDocs(
        router: Router,
        openAPIObject: OpenAPIObject
    ): void {
        if (this.apiDocsPath) {
            router.use(this.apiDocsPath, swaggerUi.serve);
            router.get(this.apiDocsPath, swaggerUi.setup(openAPIObject));
            router.get(`${this.apiDocsPath}/openapi.json`, (_req, res) => {
                res.status(200).send(openAPIObject);
            });
        }
    }
}

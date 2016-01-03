import "babel-polyfill";
import {Router} from "express";

import * as convert from "./convert";
import parseBody from "./parse-body";
import * as validate from "./validate-middleware";
import * as wrap from "./wrap";

export default function convexpress (options) {
    const router = Router().use(parseBody());
    router.swagger = {
        swagger: "2.0",
        host: options.host,
        basePath: options.basePath || "/",
        info: options.info,
        consumes: ["application/json"],
        produces: ["application/json"],
        paths: {}
    };
    router.convroute = function (route) {
        // Attach route to router
        const middleware = [
            validate.middleware(route.parameters),
            ...(route.middleware || [])
        ];
        router[route.method](
            route.path,
            middleware.map(wrap.middleware),
            wrap.handler(route.handler)
        );
        // Update the swagger document
        const swaggerPath = convert.path(route.path);
        router.swagger.paths[swaggerPath] = {
            ...router.swagger.paths[swaggerPath],
            [route.method]: {
                description: route.description,
                tags: route.tags || [],
                parameters: convert.parameters(route.parameters),
                responses: {
                    ...route.responses,
                    ...validate.responses
                }
            }
        };
        // Allow method chaining
        return router;
    };
    router.serveSwagger = function (path = "/swagger.json") {
        router.get(path, (req, res) => res.status(200).send(router.swagger));
        return router;
    };
    return router;
}

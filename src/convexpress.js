import {json} from "body-parser";
import {Router} from "express";

import * as convert from "./convert";
import * as validate from "./validate-middleware";
import wrap from "./wrap";

export default function convexpress (options) {
    const router = Router().use(json());
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
        router[route.method](
            route.path,
            [validate.middleware(route.parameters)].concat(route.middleware || []),
            wrap(route.handler)
        );
        // Update the swagger document
        const swaggerPath = convert.path(route.path);
        router.swagger.paths[swaggerPath] = {
            ...router.swagger.paths[swaggerPath],
            [route.method]: {
                description: route.description,
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

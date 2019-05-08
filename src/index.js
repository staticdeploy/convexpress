const { Router } = require("express");
const glob = require("glob");
const swaggerUi = require("swagger-ui-express");

const convert = require("./convert");
const parseBody = require("./parse-body");
const validate = require("./validate-middleware");
const wrap = require("./wrap");

module.exports = function convexpress(options) {
    const router = Router().use(parseBody(options.bodyParserOptions));
    router.swagger = {
        swagger: "2.0",
        host: options.host,
        basePath: options.basePath || "/",
        info: options.info,
        consumes: ["application/json"],
        produces: ["application/json"],
        paths: {}
    };
    router.convroute = route => {
        // Make sure the method is lowercase, otherwise router[method] is
        // undefined
        const method = convert.method(route.method);
        // Attach route to router
        const middleware = [
            validate.middleware(route.parameters),
            ...(route.middleware || [])
        ];
        router[method](
            route.path,
            middleware.map(wrap.middleware),
            wrap.handler(route.handler)
        );
        // Update the swagger document
        const swaggerPath = convert.path(route.path);
        router.swagger.paths[swaggerPath] = {
            ...router.swagger.paths[swaggerPath],
            [method]: {
                description: route.description,
                tags: route.tags || [],
                parameters: convert.parameters(route.parameters),
                operationId: route.operationId,
                responses: {
                    ...route.responses,
                    ...validate.responses
                }
            }
        };
        // Allow method chaining
        return router;
    };
    router.serveSwagger = () => {
        router.get("/swagger.json", (req, res) =>
            res.status(200).send(router.swagger)
        );
        router.use("/swagger/", swaggerUi.serve);
        /*
         *  We use `../swagger.json` instead of `/swagger.json` for the docs
         *  definition url because the swagger.json route we registered above
         *  is only absolute to our router mountpoint. Since the url is used
         *  client-side by the swagger-ui page, we need use a relative path.
         *
         *  Example cases where not using a relative path would be a problem:
         *
         *  - convexpress router used in a subroute:
         *
         *      express().use("/api/v1/", convexpressRouter);
         *
         *    In this case the ui would expect to find the definition at
         *    `/swagger.json`, while it's actually at `/api/v1/swagger.json`
         *
         *  - server behind a location-rewriting reverse proxy:
         *
         *      # nginx rule
         *      location /api/v1 {
         *          rewrite ^/api/v1/(.*) /$1;
         *          proxy_pass http://server;
         *          proxy_redirect / /api/v1/;
         *      }
         *
         *    Same as before, the ui would expect to find the definition at
         *    `/swagger.json`, while it's actually at `/api/v1/swagger.json`
         *
         */
        router.get(
            "/swagger/",
            swaggerUi.setup(null, { swaggerUrl: "../swagger.json" })
        );
        return router;
    };
    router.loadFrom = pattern => {
        const routePaths = glob.sync(pattern, { absolute: true });
        routePaths.forEach(routePath => {
            const routeExport = require(routePath);
            const route =
                routeExport && routeExport.default
                    ? routeExport.default
                    : routeExport;
            router.convroute(route);
        });
        return router;
    };
    return router;
};

import {json} from "body-parser";
import {Router} from "express";

import * as validate from "./validate-middleware";
import * as convert from "./convert";

export default class Convexpress {

    constructor (info) {
        this.router = Router()
            .use(json())
            .get("/swagger.json", (req, res) => {
                res.status(200).send(this.swagger);
            });
        this.swagger = {
            swagger: "2.0",
            info: info,
            paths: {}
        };
    }

    use (route) {
        // Attach route to router
        this.router[route.method](
            route.path,
            [validate.middleware(route.parameters)].concat(route.middleware || []),
            route.handler
        );
        // Update the swagger document
        const swaggerPath = convert.path(route.path);
        this.swagger.paths[swaggerPath] = {
            ...this.swagger.paths[swaggerPath],
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
        return this;
    }

}

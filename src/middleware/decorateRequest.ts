import { OpenAPIObject } from "openapi3-ts";

import { ConvrequestHandler, IConvroute } from "../types";

/**
 * Attaches the `convroute` and the `openAPIObject` properties to the express
 * request object
 */
export default function decorateRequest(
    convroute: IConvroute,
    openAPIObject: OpenAPIObject
): ConvrequestHandler {
    return (req, _res, next) => {
        req.convroute = convroute;
        req.openAPIObject = openAPIObject;
        next();
    };
}

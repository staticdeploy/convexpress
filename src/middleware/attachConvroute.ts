import { ConvrequestHandler, IConvroute } from "../types";

/**
 * Attaches the `convroute` property to the express request object. The property
 * contains information about the convroute that is handling the request
 */
export default function attachConvroute(
    convroute: IConvroute
): ConvrequestHandler {
    return (req, _res, next) => {
        req.convroute = {
            method: convroute.method,
            path: convroute.path,
            operationObject: convroute.operationObject
        };
        next();
    };
}

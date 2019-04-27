import { ConvrequestHandler, ErrorConvrequestHandler } from "../types";

/*
 * Convexpress middleware handlers, route handlers, and error handlers can be
 * async. Express though doesn't catch any async errors that might be thrown by
 * them. By wrapping those functions with the two functions below we rectify
 * that.
 */

export function handler(
    convrequestHandler: ConvrequestHandler
): ConvrequestHandler {
    return async (req, res, next) => {
        try {
            await convrequestHandler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

export function errorHandler(
    errorConvrequestHandler: ErrorConvrequestHandler
): ErrorConvrequestHandler {
    return async (err, req, res, next) => {
        try {
            await errorConvrequestHandler(err, req, res, next);
        } catch (errorHandlerError) {
            next(errorHandlerError);
        }
    };
}

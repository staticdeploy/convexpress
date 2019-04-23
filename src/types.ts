import { NextFunction, Request, Response } from "express";
import { OpenAPIObject, OperationObject } from "openapi3-ts";

/** @ignore */
export type BaseOpenAPIObject = Pick<
    OpenAPIObject,
    | "openapi"
    | "info"
    | "servers"
    | "components"
    | "security"
    | "tags"
    | "externalDocs"
>;

/** @ignore */
export type Method =
    | "get"
    | "post"
    | "put"
    | "delete"
    | "patch"
    | "options"
    | "head"
    | "checkout"
    | "connect"
    | "copy"
    | "lock"
    | "merge"
    | "mkactivity"
    | "mkcol"
    | "move"
    | "m-search"
    | "notify"
    | "propfind"
    | "proppatch"
    | "purge"
    | "report"
    | "search"
    | "subscribe"
    | "trace"
    | "unlock"
    | "unsubscribe";

/**
 * Object defining a convexpress route
 */
export interface IConvroute {
    /** Method to handle */
    method: Method;
    /** Path to handle */
    path: string;
    /** OpenAPI [Operation Object](https://git.io/fjOmi) describing the route */
    operationObject: OperationObject;
    /** Route-specific middleware */
    middleware?: ConvrequestHandler[];
    /** Route-specific error handlers */
    errorHandlers?: ErrorConvrequestHandler[];
    /** Main handler for the request */
    handler: ConvrequestHandler;
}

/**
 * Request object passed to a convroute middleware and handler. It's an express
 * `Request` object with some additional properties attached:
 *
 * - `convroute`: the convroute that matched the request
 * - `openAPIObject`: the full [OpenAPI Object](https://git.io/fjOmr) of the
 *   Convexpress instance
 */
export interface IConvrequest extends Request {
    convroute: IConvroute;
    openAPIObject: OpenAPIObject;
}

/**
 * Specialized express `RequestHandler` taking an `IConvrequest` instead of an
 * express `Request`
 */
export type ConvrequestHandler = (
    req: IConvrequest,
    res: Response,
    next: NextFunction
) => any;

/**
 * Specialized express `ErrorRequestHandler` taking an `IConvrequest` instead of
 * an express `Request`
 */
export type ErrorConvrequestHandler = (
    error: any,
    req: IConvrequest,
    res: Response,
    next: NextFunction
) => any;

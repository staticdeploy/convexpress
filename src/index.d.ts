/// <reference types="body-parser" />
/// <reference types="express" />
import { OptionsJson } from "body-parser";
import { RequestHandler, Router } from "express";

declare namespace convexpress {
    interface IResponseDefinition {
        description?: string;
        schema?: any;
        headers?: any;
        examples?: any;
    }
    interface IParameter {
        name: string;
        description?: string;
        in: "body" | "path" | "query" | "header";
        required?: boolean;
        type?: string;
        schema?: any;
    }

    interface IConvRoute {
        path: string;
        method: string;
        handler: RequestHandler;
        parameters?: IParameter[];
        middleware?: RequestHandler[];
        description?: string;
        tags?: string[];
        responses?: {
            [statusCode: string]: IResponseDefinition;
        };
    }

    interface IConvRouter extends Router {
        convroute: (route: IConvRoute) => this;
        serveSwagger: () => this;
        loadFrom: (pattern: string) => this;
    }

    interface IOptions {
        host: string;
        basePath?: string;
        info: string;
        bodyParserOptions?: {
            limit?: OptionsJson["limit"];
            strict?: OptionsJson["strict"];
            verify?: OptionsJson["verify"];
        };
    }
}

declare function convexpress(
    options: convexpress.IOptions
): convexpress.IConvRouter;

export = convexpress;

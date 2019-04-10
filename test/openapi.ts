import { expect } from "chai";

import { Convexpress } from "../src";

describe("openapi generation", () => {
    it("an openapi object is generated from the Convexpress instance base openapi object and convroutes' operation objects", async () => {
        const openapiObject = new Convexpress({
            baseOpenAPIObject: {
                openapi: "3.0.2",
                info: { title: "title", version: "1" }
            }
        })
            .addConvroute({
                method: "get",
                path: "/",
                operationObject: { responses: [] },
                handler() {
                    // Noop
                }
            })
            .addConvroute({
                method: "post",
                path: "/",
                operationObject: { responses: [] },
                handler() {
                    // Noop
                }
            })
            .generateOpenAPIObject();

        expect(openapiObject).to.deep.equal({
            openapi: "3.0.2",
            info: { title: "title", version: "1" },
            paths: {
                "/": {
                    get: { responses: [] },
                    post: { responses: [] }
                }
            }
        });
    });
});

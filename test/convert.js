import {expect} from "chai";

import {parameters, path} from "../src/convert";

describe("path", () => {
    it("converts from expressjs path syntax to swagger path syntax", () => {
        const expressPaths = [
            "/",
            "/user",
            "/user/:id",
            "/user/:id/",
            "/user/:id/:prop",
            "/user/:id/role",
            "/user/:id/role/",
            "/user/:id/role/:role"
        ];
        const swaggerPaths = [
            "/",
            "/user",
            "/user/{id}",
            "/user/{id}/",
            "/user/{id}/{prop}",
            "/user/{id}/role",
            "/user/{id}/role/",
            "/user/{id}/role/{role}"
        ];
        expect(expressPaths.map(path)).to.deep.equal(swaggerPaths);
    });
});

describe("parameters", () => {
    it("converts only not supported json-schema parameters property to x-schema", () => {
        const inputParameters = [{
            name: "paramOne",
            schema: {
                key: "value",
                id: "value",
                $schema: "value",
                additionalItems: "value",
                definitions: "value",
                patternProperties: "value",
                dependencies: "value",
                anyOf: "value",
                oneOf: "value",
                not: "value"
            }
        }, {
            name: "paramTwo"
        }];
        const outputParameters = [{
            name: "paramOne",
            schema: {
                key: "value"
            },
            "x-schema": {
                id: "value",
                $schema: "value",
                additionalItems: "value",
                definitions: "value",
                patternProperties: "value",
                dependencies: "value",
                anyOf: "value",
                oneOf: "value",
                not: "value"
            }
        }, {
            name: "paramTwo",
            type: "string"
        }];
        expect(parameters(inputParameters)).to.deep.equal(outputParameters);
    });
});
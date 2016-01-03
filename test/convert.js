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
    it("converts the json-schema parameters property to an empty object", () => {
        const inputParameters = [
            {name: "paramOne", schema: {key: "value"}},
            {name: "paramTwo"}
        ];
        const outputParameters = [
            {name: "paramOne", schema: {}, "x-schema": {key: "value"}},
            {name: "paramTwo"}
        ];
        expect(parameters(inputParameters)).to.deep.equal(outputParameters);
    });
});

import { expect } from "chai";

import convertPath from "../../src/utils/convertPath";

describe("util convertPath", () => {
    it("converts a path in expressjs syntax to a path in OpenAPI syntax", () => {
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
        const openapiPaths = [
            "/",
            "/user",
            "/user/{id}",
            "/user/{id}/",
            "/user/{id}/{prop}",
            "/user/{id}/role",
            "/user/{id}/role/",
            "/user/{id}/role/{role}"
        ];
        expect(expressPaths.map(convertPath)).to.deep.equal(openapiPaths);
    });
});

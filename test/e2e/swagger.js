const { expect } = require("chai");
const request = require("supertest");

const getServer = require("./get-server");

describe("e2e test: swagger", () => {
    it("serving the (correct) swagger definition", async () => {
        await request(getServer())
            .get("/swagger.json")
            .expect(200)
            .expect({
                swagger: "2.0",
                host: "localhost:8080",
                basePath: "/",
                info: {
                    title: "petstore",
                    version: "1.0.0"
                },
                consumes: ["application/json"],
                produces: ["application/json"],
                paths: {
                    "/pets": {
                        get: {
                            description: "Get pets",
                            tags: ["pets"],
                            parameters: [],
                            responses: {
                                "200": { description: "Pets list" },
                                "400": { description: "Validation failed" }
                            }
                        },
                        post: {
                            description: "Create pet",
                            tags: ["pets"],
                            parameters: [
                                {
                                    name: "pet",
                                    in: "body",
                                    required: true,
                                    schema: {
                                        type: "object",
                                        properties: {
                                            species: {
                                                description: "Pet species",
                                                type: "string"
                                            }
                                        },
                                        additionalProperties: false,
                                        required: ["species"]
                                    },
                                    "x-schema": {
                                        type: "object",
                                        properties: {
                                            species: {
                                                description: "Pet species",
                                                type: "string"
                                            }
                                        },
                                        additionalProperties: false,
                                        required: ["species"]
                                    }
                                }
                            ],
                            responses: {
                                "201": { description: "Created pet species" },
                                "400": { description: "Validation failed" }
                            }
                        }
                    }
                }
            });
    });

    it("serving the ui", async () => {
        const res = await request(getServer())
            .get("/swagger/")
            .expect(200);
        expect(res.headers["content-type"]).to.equal(
            "text/html; charset=utf-8"
        );
        expect(res.text).to.contain("<title>Swagger UI</title>");
    });
});

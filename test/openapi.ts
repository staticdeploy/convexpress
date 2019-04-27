// tslint:disable no-invalid-template-strings
import { expect } from "chai";
import express from "express";
import sinon from "sinon";
import request from "supertest";

import { Convexpress } from "../src";

describe("openapi features", () => {
    describe("an OpenAPI Object is generated from the Convexpress instance base OpenAPI Object and convroutes' Operation Objects", () => {
        it("and attached to each request object", async () => {
            const handler = sinon.spy((_req, res) => {
                res.status(200).send();
            });
            const router = new Convexpress({
                baseOpenAPIObject: {
                    openapi: "3.0.2",
                    info: { title: "title", version: "1" }
                }
            })
                .addConvroute({
                    method: "get",
                    path: "/",
                    operationObject: { responses: [] },
                    handler: handler
                })
                .addConvroute({
                    method: "post",
                    path: "/",
                    operationObject: { responses: [] },
                    handler: handler
                })
                .generateRouter();

            await request(express().use(router)).get("/");
            expect(handler).to.have.callCount(1);
            const req = handler.getCall(0).args[0];
            expect(req)
                .to.have.property("openAPIObject")
                .that.deep.equals({
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

        describe("and served at ${apiDocsPath}/openapi.json, if apiDocsPath is not null", () => {
            it("case: default apiDocsPath", () => {
                const router = new Convexpress({
                    baseOpenAPIObject: {
                        openapi: "3.0.2",
                        info: { title: "title", version: "1" }
                    }
                }).generateRouter();

                return request(express().use(router))
                    .get("/api-docs/openapi.json")
                    .expect(200)
                    .expect({
                        openapi: "3.0.2",
                        info: { title: "title", version: "1" },
                        paths: {}
                    });
            });

            it("case: custom apiDocsPath", () => {
                const router = new Convexpress({
                    baseOpenAPIObject: {
                        openapi: "3.0.2",
                        info: { title: "title", version: "1" }
                    },
                    apiDocsPath: "/customPath"
                }).generateRouter();

                return request(express().use(router))
                    .get("/customPath/openapi.json")
                    .expect(200)
                    .expect({
                        openapi: "3.0.2",
                        info: { title: "title", version: "1" },
                        paths: {}
                    });
            });
        });

        it("and NOT served at ${apiDocsPath}/openapi.json, if apiDocsPath is null", () => {
            const router = new Convexpress({
                baseOpenAPIObject: {
                    openapi: "3.0.2",
                    info: { title: "title", version: "1" }
                },
                apiDocsPath: null
            }).generateRouter();

            return request(express().use(router))
                .get("/api-docs/openapi.json")
                .expect(404);
        });
    });

    describe("a swagger-ui is served at ${apiDocsPath}/, if apiDocsPath is not null", () => {
        it("case: default apiDocsPath", () => {
            const router = new Convexpress({
                baseOpenAPIObject: {
                    openapi: "3.0.2",
                    info: { title: "title", version: "1" }
                }
            }).generateRouter();

            return request(express().use(router))
                .get("/api-docs/")
                .expect(200)
                .expect(/Swagger UI/);
        });

        it("case: custom apiDocsPath", () => {
            const router = new Convexpress({
                baseOpenAPIObject: {
                    openapi: "3.0.2",
                    info: { title: "title", version: "1" }
                },
                apiDocsPath: "/customPath"
            }).generateRouter();

            return request(express().use(router))
                .get("/customPath/")
                .expect(200)
                .expect(/Swagger UI/);
        });
    });

    it("a swagger-ui is NOT served at ${apiDocsPath}/, if apiDocsPath is null", () => {
        const router = new Convexpress({
            baseOpenAPIObject: {
                openapi: "3.0.2",
                info: { title: "title", version: "1" }
            },
            apiDocsPath: null
        }).generateRouter();

        return request(express().use(router))
            .get("/api-docs/")
            .expect(404);
    });
});

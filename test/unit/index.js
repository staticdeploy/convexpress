const { expect } = require("chai");
const { createTree, destroyTree } = require("create-fs-tree");
const os = require("os");
const path = require("path");
const proxyquire = require("proxyquire");
const { all, always, is } = require("ramda");
const sinon = require("sinon");
const swaggerUi = require("swagger-ui-express");

// Given how express.Router is defined and used, it's simpler to stub at the
// module level with proxyquire than at the method level with sinon.stub
const router = {
    get: sinon.spy(() => router),
    post: sinon.spy(() => router),
    put: sinon.spy(() => router),
    use: sinon.spy(() => router)
};
const Router = always(router);
const convexpress = proxyquire("../../src", {
    express: {
        Router
    }
});

describe("convexpress", () => {
    beforeEach(() => {
        router.get.resetHistory();
        router.post.resetHistory();
        router.put.resetHistory();
        router.use.resetHistory();
    });

    describe("convexpress router", () => {
        it("is an express router", () => {
            const app = convexpress({});
            expect(app).to.equal(router);
        });
    });

    describe("convroute method", () => {
        it("register routes on the express router", () => {
            const mw = sinon.spy();
            const handler = sinon.spy();
            convexpress({})
                .convroute({
                    path: "/path/one",
                    method: "post",
                    middleware: [mw],
                    handler: handler
                })
                .convroute({
                    path: "/path/two",
                    method: "post",
                    handler: handler
                });
            expect(router.post).to.have.callCount(2);
            const firstCall = router.post.getCall(0);
            expect(firstCall.args[0]).to.equal("/path/one");
            expect(firstCall.args[1]).to.satisfy(is(Array));
            expect(firstCall.args[1]).to.satisfy(all(is(Function)));
            expect(firstCall.args[2]).to.be.a("function");
            const secondCall = router.post.getCall(1);
            expect(secondCall.args[0]).to.equal("/path/two");
            expect(secondCall.args[1]).to.satisfy(is(Array));
            expect(secondCall.args[1]).to.satisfy(all(is(Function)));
            expect(secondCall.args[2]).to.be.a("function");
        });

        it("adds them to the swagger definition", () => {
            const handler = sinon.spy();
            const options = {
                info: {
                    title: "api",
                    version: "1.0.0"
                },
                host: "example.com"
            };
            const app = convexpress(options)
                .convroute({
                    operationId: "operation id one",
                    path: "/path/:one",
                    method: "post",
                    handler: handler,
                    tags: ["tag"],
                    description: "path one",
                    parameters: [
                        {
                            name: "param",
                            schema: {
                                type: "object"
                            }
                        }
                    ],
                    responses: {
                        "200": { description: "ok" }
                    }
                })
                .convroute({
                    operationId: "operation id two",
                    path: "/path/:two",
                    method: "put",
                    handler: handler,
                    description: "path two",
                    parameters: [{ name: "param" }],
                    responses: {
                        "200": { description: "ok" }
                    }
                });
            expect(app.swagger).to.deep.equal({
                swagger: "2.0",
                info: {
                    title: "api",
                    version: "1.0.0"
                },
                host: "example.com",
                basePath: "/",
                consumes: ["application/json"],
                produces: ["application/json"],
                paths: {
                    "/path/{one}": {
                        post: {
                            operationId: "operation id one",
                            description: "path one",
                            tags: ["tag"],
                            parameters: [
                                {
                                    name: "param",
                                    schema: {
                                        type: "object"
                                    },
                                    "x-schema": {
                                        type: "object"
                                    }
                                }
                            ],
                            responses: {
                                "200": { description: "ok" },
                                "400": { description: "Validation failed" }
                            }
                        }
                    },
                    "/path/{two}": {
                        put: {
                            operationId: "operation id two",
                            description: "path two",
                            tags: [],
                            parameters: [{ name: "param", type: "string" }],
                            responses: {
                                "200": { description: "ok" },
                                "400": { description: "Validation failed" }
                            }
                        }
                    }
                }
            });
        });
    });

    describe("serveSwagger method", () => {
        it("registers the /swagger.json and the /swagger/ routes on the express router", () => {
            convexpress({}).serveSwagger();
            expect(router.get).to.have.been.calledWith(
                "/swagger.json",
                sinon.match.func
            );
            expect(router.get).to.have.been.calledWith(
                "/swagger/",
                sinon.match.func
            );
        });

        it("uses the swaggerUi middleware on route /swagger/ of the express router", () => {
            convexpress({}).serveSwagger();
            expect(router.use).to.have.been.calledWith(
                "/swagger/",
                swaggerUi.serve
            );
        });
    });

    describe("loadFrom method", () => {
        const dir = path.join(os.tmpdir(), "api");
        before(() => {
            createTree(dir, {
                pets: {
                    "get.js": 'module.exports = "pets/get.js"',
                    "{petId}": {
                        "get.js": 'module.exports = "pets/{petId}/get.js"'
                    }
                }
            });
        });
        after(() => {
            destroyTree(dir);
        });

        it("loads routes from files matching the passed-in pattern", () => {
            const app = convexpress({});
            sinon.stub(app, "convroute");
            app.loadFrom(`${dir}/**/*.js`);
            expect(app.convroute).to.have.callCount(2);
            expect(app.convroute).to.have.been.calledWith("pets/get.js");
            expect(app.convroute).to.have.been.calledWith(
                "pets/{petId}/get.js"
            );
        });
    });
});

import chai, {expect} from "chai";
import {all, always, is} from "ramda";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import convexpress from "../src/convexpress";

chai.use(sinonChai);

describe("convexpress router", () => {

    const router = {
        get: sinon.spy(() => router),
        post: sinon.spy(() => router),
        put: sinon.spy(() => router),
        use: sinon.spy(() => router)
    };
    const Router = always(router);

    before(() => {
        convexpress.__Rewire__("Router", Router);
    });
    after(() => {
        convexpress.__ResetDependency__("Router");
    });
    beforeEach(() => {
        router.get.reset();
        router.post.reset();
        router.put.reset();
        router.use.reset();
    });

    it("is an express router", () => {
        const app = convexpress({});
        expect(app).to.equal(router);
    });

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
                path: "/path/:one",
                method: "post",
                handler: handler,
                tags: ["tag"],
                description: "path one",
                parameters: [{
                    name: "param",
                    schema: {
                        type: "object"
                    }
                }],
                responses: {
                    "200": {description: "ok"}
                }
            })
            .convroute({
                path: "/path/:two",
                method: "put",
                handler: handler,
                description: "path two",
                parameters: [{name: "param"}],
                responses: {
                    "200": {description: "ok"}
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
                        description: "path one",
                        tags: ["tag"],
                        parameters: [{
                            name: "param",
                            schema: {},
                            "x-schema": {
                                type: "object"
                            }
                        }],
                        responses: {
                            "200": {description: "ok"},
                            "400": {description: "Validation failed"}
                        }
                    }
                },
                "/path/{two}": {
                    put: {
                        description: "path two",
                        tags: [],
                        parameters: [{name: "param"}],
                        responses: {
                            "200": {description: "ok"},
                            "400": {description: "Validation failed"}
                        }
                    }
                }
            }
        });
    });

});

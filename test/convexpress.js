import chai, {expect} from "chai";
import {all, always, contains, is} from "ramda";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import Convexpress from "../src/convexpress";

chai.use(sinonChai);

describe("Convexpress instances", () => {

    it("instances have a router property", () => {
        const convexpress = new Convexpress({});
        expect(convexpress).to.have.property("router");
    });

});

describe("Registering routes", () => {

    const router = {
        get: sinon.spy(() => router),
        post: sinon.spy(() => router),
        put: sinon.spy(() => router),
        use: sinon.spy(() => router)
    };
    const Router = always(router);

    before(() => {
        Convexpress.__Rewire__("Router", Router);
    });
    after(() => {
        Convexpress.__ResetDependency__("Router");
    });
    beforeEach(() => {
        router.get.reset();
        router.post.reset();
        router.put.reset();
        router.use.reset();
    });

    it("registers them to the express router", () => {
        const convexpress = new Convexpress({});
        const mw = sinon.spy();
        const handler = sinon.spy();
        convexpress
            .use({
                path: "/path/one",
                method: "post",
                middleware: [mw],
                handler: handler
            })
            .use({
                path: "/path/two",
                method: "post",
                handler: handler
            });
        expect(router.post).to.have.callCount(2);
        const firstCall = router.post.getCall(0);
        expect(firstCall.args[0]).to.equal("/path/one");
        expect(firstCall.args[1]).to.satisfy(is(Array));
        expect(firstCall.args[1]).to.satisfy(all(is(Function)));
        expect(firstCall.args[1]).to.satisfy(contains(mw));
        expect(firstCall.args[2]).to.equal(handler);
        const secondCall = router.post.getCall(1);
        expect(secondCall.args[0]).to.equal("/path/two");
        expect(secondCall.args[1]).to.satisfy(is(Array));
        expect(secondCall.args[1]).to.satisfy(all(is(Function)));
        expect(secondCall.args[1]).not.to.satisfy(contains(mw));
        expect(secondCall.args[2]).to.equal(handler);
    });

    it("adds them to the swagger definition", () => {
        const convexpress = new Convexpress({});
        const handler = sinon.spy();
        convexpress
            .use({
                path: "/path/:one",
                method: "post",
                handler: handler,
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
            .use({
                path: "/path/:two",
                method: "put",
                handler: handler,
                description: "path two",
                parameters: [{name: "param"}],
                responses: {
                    "200": {description: "ok"}
                }
            });
        expect(convexpress.swagger).to.deep.equal({
            swagger: "2.0",
            info: {},
            paths: {
                "/path/{one}": {
                    post: {
                        description: "path one",
                        parameters: [{
                            name: "param",
                            schema: {}
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

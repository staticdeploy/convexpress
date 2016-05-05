import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import {handler, middleware} from "../../src/wrap";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("wrap.handler", () => {

    it("returns a function", () => {
        const ret = handler(() => null);
        expect(ret).to.be.a("function");
    });

    describe("returns a function which", () => {

        it("has length 2", () => {
            const fn = sinon.spy();
            const ret = handler(fn);
            expect(ret).to.have.length(2);
        });

        it("returns a promise", () => {
            const req = {};
            const res = {};
            const fn = sinon.spy();
            const ret = handler(fn)(req, res);
            expect(ret).to.be.an.instanceOf(Promise);
        });

        it("executes the original function when called proxying its first two arguments (req, res)", async () => {
            const req = {};
            const res = {};
            const fn = sinon.spy();
            await handler(fn)(req, res);
            expect(fn).to.have.callCount(1);
            expect(fn).to.have.been.calledWith(req, res);
        });

        describe("when the original function synchronously throws", () => {

            it("handles the exception (the promise returned by the wrapped function does not fail)", async () => {
                const req = {};
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const fn = sinon.stub().throws(new Error("Error"));
                const retPromise = handler(fn)(req, res);
                await expect(retPromise).to.be.fulfilled;
            });

            it("terminates the request by sending a \"500 Internal server error\" response", async () => {
                const req = {};
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const fn = sinon.stub().throws(new Error("Error"));
                await handler(fn)(req, res);
                expect(res.status).to.have.callCount(1);
                expect(res.status).to.have.been.calledWith(500);
                expect(res.send).to.have.callCount(1);
                expect(res.send).to.have.been.calledWith({
                    message: "Internal server error"
                });
            });

            it("if a logger `req.log` is defined, logs the error using that logger", async () => {
                const req = {
                    log: {
                        error: sinon.spy()
                    }
                };
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const err = new Error("Error");
                const fn = sinon.stub().throws(err);
                await handler(fn)(req, res);
                expect(req.log.error).to.have.callCount(1);
                expect(req.log.error).to.have.been.calledWith(
                    err, "Uncaught exception"
                );
            });

        });

        describe("when the original function returns an eventually failing promise", () => {

            it("handles the failure (the promise returned by the wrapped function does not fail)", async () => {
                const req = {};
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const fn = sinon.stub().returns(Promise.reject(new Error("Error")));
                const retPromise = handler(fn)(req, res);
                await expect(retPromise).to.be.fulfilled;
            });

            it("terminates the request by sending a \"500 Internal server error\" response", async () => {
                const req = {};
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const fn = sinon.stub().returns(Promise.reject(new Error("Error")));
                await handler(fn)(req, res);
                expect(res.status).to.have.callCount(1);
                expect(res.status).to.have.been.calledWith(500);
                expect(res.send).to.have.callCount(1);
                expect(res.send).to.have.been.calledWith({
                    message: "Internal server error"
                });
            });

            it("if a logger `req.log` is defined, logs the error using that logger", async () => {
                const req = {
                    log: {
                        error: sinon.spy()
                    }
                };
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const err = new Error("Error");
                const fn = sinon.stub().returns(Promise.reject(err));
                await handler(fn)(req, res);
                expect(req.log.error).to.have.callCount(1);
                expect(req.log.error).to.have.been.calledWith(
                    err, "Uncaught exception"
                );
            });

        });

    });

});

describe("wrap.middleware", () => {

    it("returns a function", () => {
        const ret = middleware(() => null);
        expect(ret).to.be.a("function");
    });

    describe("returns a function which", () => {

        it("has length 3", () => {
            const fn = sinon.spy();
            const ret = middleware(fn);
            expect(ret).to.have.length(3);
        });

        it("returns a promise", () => {
            const req = {};
            const res = {};
            const fn = sinon.spy();
            const ret = middleware(fn)(req, res);
            expect(ret).to.be.an.instanceOf(Promise);
        });

        it("executes the original function when called proxying its first three arguments (req, res, next)", async () => {
            const req = {};
            const res = {};
            const next = () => null;
            const fn = sinon.spy();
            await middleware(fn)(req, res, next);
            expect(fn).to.have.callCount(1);
            expect(fn).to.have.been.calledWith(req, res, next);
        });

        describe("when the original function synchronously throws", () => {

            it("handles the exception (the returned promise does not fail)", async () => {
                const req = {};
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const fn = sinon.stub().throws(new Error("Error"));
                const retPromise = middleware(fn)(req, res);
                await expect(retPromise).to.be.fulfilled;
            });

            it("terminates the request by sending a \"500 Internal server error\" response", async () => {
                const req = {};
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const fn = sinon.stub().throws(new Error("Error"));
                await middleware(fn)(req, res);
                expect(res.status).to.have.callCount(1);
                expect(res.status).to.have.been.calledWith(500);
                expect(res.send).to.have.callCount(1);
                expect(res.send).to.have.been.calledWith({
                    message: "Internal server error"
                });
            });

            it("if a logger `req.log` is defined, logs the error using that logger", async () => {
                const req = {
                    log: {
                        error: sinon.spy()
                    }
                };
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const err = new Error("Error");
                const fn = sinon.stub().throws(err);
                await middleware(fn)(req, res);
                expect(req.log.error).to.have.callCount(1);
                expect(req.log.error).to.have.been.calledWith(
                    err, "Uncaught exception"
                );
            });

        });

        describe("when the original function returns an eventually failing promise", () => {

            it("handles the failure (the promise returned by the wrapped function does not fail)", async () => {
                const req = {};
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const fn = sinon.stub().returns(Promise.reject(new Error("Error")));
                const retPromise = middleware(fn)(req, res);
                await expect(retPromise).to.be.fulfilled;
            });

            it("terminates the request by sending a \"500 Internal server error\" response", async () => {
                const req = {};
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const fn = sinon.stub().returns(Promise.reject(new Error("Error")));
                await middleware(fn)(req, res);
                expect(res.status).to.have.callCount(1);
                expect(res.status).to.have.been.calledWith(500);
                expect(res.send).to.have.callCount(1);
                expect(res.send).to.have.been.calledWith({
                    message: "Internal server error"
                });
            });

            it("if a logger `req.log` is defined, logs the error using that logger", async () => {
                const req = {
                    log: {
                        error: sinon.spy()
                    }
                };
                const res = {
                    status: sinon.spy(() => res),
                    send: sinon.spy()
                };
                const err = new Error("Error");
                const fn = sinon.stub().returns(Promise.reject(err));
                await middleware(fn)(req, res);
                expect(req.log.error).to.have.callCount(1);
                expect(req.log.error).to.have.been.calledWith(
                    err, "Uncaught exception"
                );
            });

        });

    });

});

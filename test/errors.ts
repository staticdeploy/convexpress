import { expect } from "chai";
import express from "express";
import sinon from "sinon";
import request from "supertest";

import { Convexpress, ErrorConvrequestHandler } from "../src";

describe("error handling", () => {
    const baseOpenAPIObject = {
        openapi: "3.0.2",
        info: { title: "title", version: "1" }
    };
    const baseConvroute = {
        method: "get" as "get",
        path: "/",
        operationObject: { responses: [] }
    };
    const baseErrorHandler: ErrorConvrequestHandler = (
        _err,
        _req,
        res,
        _next
    ) => {
        res.status(200).send();
    };

    describe("when a convroute handler throws, the error is propagated to error handlers", () => {
        it("case: error thrown synchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [errorHandler],
                    handler() {
                        throw error;
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error thrown asynchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [errorHandler],
                    async handler() {
                        throw error;
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error passed to the next function", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [errorHandler],
                    handler(_req, _res, next) {
                        next(error);
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });
    });

    describe("when a convroute middleware throws, the error is propagated to error handlers", () => {
        it("case: error thrown synchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    middleware: [
                        () => {
                            throw error;
                        }
                    ],
                    errorHandlers: [errorHandler],
                    handler() {
                        // noop
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error thrown asynchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    middleware: [
                        async () => {
                            throw error;
                        }
                    ],
                    errorHandlers: [errorHandler],
                    handler() {
                        // noop
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error passed to the next function", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    middleware: [
                        (_req, _res, next) => {
                            next(error);
                        }
                    ],
                    errorHandlers: [errorHandler],
                    handler() {
                        // noop
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });
    });

    describe("when a shared middleware throws, the error is propagated to error handlers", () => {
        it("case: error thrown synchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addMiddleware(() => {
                    throw error;
                })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [errorHandler],
                    handler() {
                        // noop
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error thrown asynchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addMiddleware(async () => {
                    throw error;
                })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [errorHandler],
                    handler() {
                        // noop
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error passed to the next function", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addMiddleware((_req, _res, next) => {
                    next(error);
                })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [errorHandler],
                    handler() {
                        // noop
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });
    });

    describe("when a convroute error handler throws, the error is propagated to the next error handler", () => {
        it("case: error thrown synchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [
                        () => {
                            throw error;
                        },
                        errorHandler
                    ],
                    handler() {
                        throw new Error();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error thrown asynchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [
                        async () => {
                            throw error;
                        },
                        errorHandler
                    ],
                    handler() {
                        throw new Error();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error passed to the next function", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [
                        (_err, _req, _res, next) => {
                            next(error);
                        },
                        errorHandler
                    ],
                    handler() {
                        throw new Error();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });
    });

    describe("when a shared error handler throws, the error is propagated to the next error handler", () => {
        it("case: error thrown synchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addErrorHandler(() => {
                    throw error;
                })
                .addErrorHandler(errorHandler)
                .addConvroute({
                    ...baseConvroute,
                    handler() {
                        throw new Error();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error thrown asynchronously", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addErrorHandler(async () => {
                    throw error;
                })
                .addErrorHandler(errorHandler)
                .addConvroute({
                    ...baseConvroute,
                    handler() {
                        throw new Error();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });

        it("case: error passed to the next function", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);
            const error = new Error();

            const router = new Convexpress({ baseOpenAPIObject })
                .addErrorHandler((_err, _req, _res, next) => {
                    next(error);
                })
                .addErrorHandler(errorHandler)
                .addConvroute({
                    ...baseConvroute,
                    handler() {
                        throw new Error();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.been.calledOnceWith(error);
        });
    });

    it("error handlers are invoked in order: convroute[0], convroute[n], shared[0], shared[n]", async () => {
        const firstErrorHandler = sinon.spy(err => {
            throw err;
        });
        const secondErrorHandler = sinon.spy(err => {
            throw err;
        });
        const thirdErrorHandler = sinon.spy(err => {
            throw err;
        });
        const fourthErrorHandler = sinon.spy(err => {
            throw err;
        });

        const router = new Convexpress({ baseOpenAPIObject })
            .addErrorHandler(thirdErrorHandler)
            .addErrorHandler(fourthErrorHandler)
            .addConvroute({
                ...baseConvroute,
                errorHandlers: [firstErrorHandler, secondErrorHandler],
                handler() {
                    throw new Error();
                }
            })
            .generateRouter();

        await request(
            express()
                .use(router)
                .use(baseErrorHandler as express.ErrorRequestHandler)
        ).get("/");

        expect(firstErrorHandler).to.have.callCount(1);
        expect(secondErrorHandler).to.have.callCount(1);
        expect(thirdErrorHandler).to.have.callCount(1);
        expect(fourthErrorHandler).to.have.callCount(1);

        expect(firstErrorHandler).to.have.been.calledImmediatelyBefore(
            secondErrorHandler
        );
        expect(secondErrorHandler).to.have.calledImmediatelyBefore(
            thirdErrorHandler
        );
        expect(thirdErrorHandler).to.have.calledImmediatelyBefore(
            fourthErrorHandler
        );
    });

    describe("error handlers have access to the req.convroute object", () => {
        it("case: convroute error handlers", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    errorHandlers: [errorHandler],
                    handler() {
                        throw new Error();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.callCount(1);
            const req = errorHandler.getCall(0).args[1];
            expect(req)
                .to.have.property("convroute")
                .that.has.property("method", "get");
        });

        it("case: shared error handlers", async () => {
            const errorHandler = sinon.spy(baseErrorHandler);

            const router = new Convexpress({ baseOpenAPIObject })
                .addErrorHandler(errorHandler)
                .addConvroute({
                    ...baseConvroute,
                    handler() {
                        throw new Error();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(errorHandler).to.have.callCount(1);
            const req = errorHandler.getCall(0).args[1];
            expect(req)
                .to.have.property("convroute")
                .that.has.property("method", "get");
        });
    });
});

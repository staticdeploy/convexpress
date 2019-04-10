import { expect } from "chai";
import express from "express";
import sinon from "sinon";
import request from "supertest";

import { Convexpress } from "../src";

describe("middleware", () => {
    const baseOpenAPIObject = {
        openapi: "3.0.2",
        info: { title: "title", version: "1" }
    };
    const baseConvroute = {
        method: "get" as "get",
        path: "/",
        operationObject: { responses: [] }
    };

    it("middleware are invoked in order: shared[0], shared[n], convroute[0], convroute[n]", async () => {
        const firstMiddleware = sinon.spy((_req, _res, next) => {
            next();
        });
        const secondMiddleware = sinon.spy((_req, _res, next) => {
            next();
        });
        const thirdMiddleware = sinon.spy((_req, _res, next) => {
            next();
        });
        const fourthMiddleware = sinon.spy((_req, _res, next) => {
            next();
        });

        const router = new Convexpress({ baseOpenAPIObject })
            .addMiddleware(firstMiddleware)
            .addMiddleware(secondMiddleware)
            .addConvroute({
                ...baseConvroute,
                middleware: [thirdMiddleware, fourthMiddleware],
                handler(_req, res) {
                    res.status(200).send();
                }
            })
            .generateRouter();

        await request(express().use(router)).get("/");

        expect(firstMiddleware).to.have.callCount(1);
        expect(secondMiddleware).to.have.callCount(1);
        expect(thirdMiddleware).to.have.callCount(1);
        expect(fourthMiddleware).to.have.callCount(1);

        expect(firstMiddleware).to.have.been.calledImmediatelyBefore(
            secondMiddleware
        );
        expect(secondMiddleware).to.have.calledImmediatelyBefore(
            thirdMiddleware
        );
        expect(thirdMiddleware).to.have.calledImmediatelyBefore(
            fourthMiddleware
        );
    });

    describe("middleware have access to the req.convroute object", () => {
        it("case: convroute middleware", async () => {
            const middleware = sinon.spy((_req, _res, next) => {
                next();
            });

            const router = new Convexpress({ baseOpenAPIObject })
                .addConvroute({
                    ...baseConvroute,
                    middleware: [middleware],
                    handler(_req, res) {
                        res.status(200).send();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(middleware).to.have.callCount(1);
            const req = middleware.getCall(0).args[0];
            expect(req)
                .to.have.property("convroute")
                .that.has.property("method", "get");
        });

        it("case: shared middleware", async () => {
            const middleware = sinon.spy((_req, _res, next) => {
                next();
            });

            const router = new Convexpress({ baseOpenAPIObject })
                .addMiddleware(middleware)
                .addConvroute({
                    ...baseConvroute,
                    handler(_req, res) {
                        res.status(200).send();
                    }
                })
                .generateRouter();

            await request(express().use(router)).get("/");

            expect(middleware).to.have.callCount(1);
            const req = middleware.getCall(0).args[0];
            expect(req)
                .to.have.property("convroute")
                .that.has.property("method", "get");
        });
    });
});

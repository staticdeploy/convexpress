import { expect } from "chai";
import express from "express";
import sinon from "sinon";
import request from "supertest";

import { Convexpress } from "../src";

describe("convroute handlers", () => {
    const baseOpenAPIObject = {
        openapi: "3.0.2",
        info: { title: "title", version: "1" }
    };
    const baseConvroute = {
        method: "get" as "get",
        path: "/",
        operationObject: { responses: [] }
    };

    it("have access to the req.convroute object", async () => {
        const handler = sinon.spy((_req, res) => {
            res.status(200).send();
        });

        const router = new Convexpress({ baseOpenAPIObject })
            .addConvroute({
                ...baseConvroute,
                handler
            })
            .generateRouter();

        await request(express().use(router)).get("/");

        expect(handler).to.have.callCount(1);
        const req = handler.getCall(0).args[0];
        expect(req)
            .to.have.property("convroute")
            .that.has.property("method", "get");
    });
});

import {json} from "body-parser";
import express from "express";
import request from "supertest-as-promised";

import {middleware} from "../src/validate-middleware";
import parseBody from "../src/parse-body";

describe("validate.middleware", () => {

    describe("optional parameters", () => {

        const params = [
            {
                name: "bodyParam",
                in: "body",
                schema: {
                    type: "object",
                    properties: {
                        key: {
                            type: "string"
                        }
                    }
                }
            },
            {
                name: "pathParam",
                in: "path"
            },
            {
                name: "queryParam",
                in: "query"
            },
            {
                name: "headerParam",
                in: "header"
            }
        ];
        const server = express()
            .use(json())
            .use("/:pathParam", middleware(params))
            .post("/:pathParam", (req, res) => res.status(200).send("OK"));

        it("not 400 on valid request [CASE: no missing parameters]", () => {
            return request(server)
                .post("/pathParamValue?queryParam=queryParamValue")
                .set("headerParam", "headerParamValue")
                .send({key: "value"})
                .expect(200)
                .expect("OK");
        });

        it("not 400 on valid request [CASE: missing all parameters]", () => {
            return request(server)
                .post("/pathParamValue")
                .expect(200)
                .expect("OK");
        });

        it("400 on invalid request [CASE: invalid body]", () => {
            return request(server)
                .post("/pathParamValue?queryParam=queryParamValue")
                .set("headerParam", "headerParamValue")
                .send({key: 1})
                .expect(400)
                .expect(/Validation failed for parameter bodyParam in body/);
        });

    });

    describe("required parameters", () => {

        const params = [
            {
                name: "bodyParam",
                in: "body",
                schema: {
                    type: "object",
                    properties: {
                        key: {
                            type: "string"
                        }
                    }
                },
                required: true
            },
            {
                name: "pathParam",
                in: "path",
                required: true
            },
            {
                name: "queryParam",
                in: "query",
                required: true
            },
            {
                name: "headerParam",
                in: "header",
                required: true
            }
        ];
        const server = express()
            .use(parseBody())
            .use("/:pathParam", middleware(params))
            .post("/:pathParam", (req, res) => res.status(200).send("OK"));

        it("not 400 on valid request", () => {
            return request(server)
                .post("/pathParamValue?queryParam=queryParamValue")
                .set("headerParam", "headerParamValue")
                .send({key: "value"})
                .expect(200)
                .expect("OK");
        });

        it("400 on invalid request [CASE: missing body]", () => {
            return request(server)
                .post("/pathParamValue?queryParam=queryParamValue")
                .set("headerParam", "headerParamValue")
                .expect(400)
                .expect(/Missing required parameter bodyParam in body/);
        });

        it("400 on invalid request [CASE: invalid body]", () => {
            return request(server)
                .post("/pathParamValue?queryParam=queryParamValue")
                .set("headerParam", "headerParamValue")
                .send({key: 1})
                .expect(400)
                .expect(/Validation failed for parameter bodyParam in body/);
        });

        it("400 on invalid request [CASE: missing query param]", () => {
            return request(server)
                .post("/pathParamValue?wrongQueryParam=queryParamValue")
                .set("headerParam", "headerParamValue")
                .send({key: "value"})
                .expect(400)
                .expect(/Missing required parameter queryParam in query/);
        });

        it("400 on invalid request [CASE: missing header param]", () => {
            return request(server)
                .post("/pathParamValue?queryParam=queryParamValue")
                .send({key: "value"})
                .expect(400)
                .expect(/Missing required parameter headerParam in header/);
        });

        it("400 on invalid request [CASE: multiple errors]", () => {
            return request(server)
                .post("/pathParamValue")
                .send({key: "value"})
                .expect(400)
                .expect(/Missing required parameter headerParam in header/)
                .expect(/Missing required parameter queryParam in query/);
        });

    });

});

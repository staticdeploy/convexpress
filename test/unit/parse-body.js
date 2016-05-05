import express from "express";
import request from "supertest-as-promised";

import parseBody from "../../src/parse-body";

describe("ensureJSONBody middleware", () => {

    const server = express()
        .use(parseBody())
        .all("/", (req, res) => res.status(200).send({
            body: req.body === undefined ? "__undefined__" : req.body
        }));

    describe("415 on non-json requests with a body", () => {
        it("GET", () => {
            return request(server)
                .get("/")
                .send("notJSON")
                .expect(415)
                .expect({
                    message: "Body must have Content-Type application/json"
                });
        });
        it("POST", () => {
            return request(server)
                .post("/")
                .send("notJSON")
                .expect(415)
                .expect({
                    message: "Body must have Content-Type application/json"
                });
        });
        it("PUT", () => {
            return request(server)
                .put("/")
                .send("notJSON")
                .expect(415)
                .expect({
                    message: "Body must have Content-Type application/json"
                });
        });
        it("DELETE", () => {
            return request(server)
                .delete("/")
                .send("notJSON")
                .expect(415)
                .expect({
                    message: "Body must have Content-Type application/json"
                });
        });
    });

    describe("no 415 on non-json requests with no body", () => {
        it("GET", () => {
            return request(server)
                .get("/")
                .expect(200)
                .expect({body: "__undefined__"});
        });
        it("POST", () => {
            return request(server)
                .post("/")
                .expect(200)
                .expect({body: "__undefined__"});
        });
        it("PUT", () => {
            return request(server)
                .put("/")
                .expect(200)
                .expect({body: "__undefined__"});
        });
        it("DELETE", () => {
            return request(server)
                .delete("/")
                .expect(200)
                .expect({body: "__undefined__"});
        });
    });

    describe("no 415 on json requests with body", () => {
        it("GET", () => {
            return request(server)
                .get("/")
                .send({})
                .expect(200)
                .expect({body: {}});
        });
        it("POST", () => {
            return request(server)
                .post("/")
                .send({})
                .expect(200)
                .expect({body: {}});
        });
        it("PUT", () => {
            return request(server)
                .put("/")
                .send({})
                .expect(200)
                .expect({body: {}});
        });
        it("DELETE", () => {
            return request(server)
                .delete("/")
                .send({})
                .expect(200)
                .expect({body: {}});
        });
    });

    describe("400 on json requests with invalid - non json - body", () => {
        it("GET", () => {
            return request(server)
                .get("/")
                .set("Content-Type", "application/json")
                .send("invalidJSON")
                .expect(400);
        });
        it("POST", () => {
            return request(server)
                .post("/")
                .set("Content-Type", "application/json")
                .send("invalidJSON")
                .expect(400);
        });
        it("PUT", () => {
            return request(server)
                .put("/")
                .set("Content-Type", "application/json")
                .send("invalidJSON")
                .expect(400);
        });
        it("DELETE", () => {
            return request(server)
                .delete("/")
                .set("Content-Type", "application/json")
                .send("invalidJSON")
                .expect(400);
        });
    });

});

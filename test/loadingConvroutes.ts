import { createTree, destroyTree } from "create-fs-tree";
import decache from "decache";
import express from "express";
import glob from "glob";
import { tmpdir } from "os";
import { join } from "path";
import request from "supertest";

import { Convexpress } from "../src";

const testDir = join(tmpdir(), "convexpress-tests");

describe("convroutes", () => {
    const convroutesPattern = `${testDir}/**/*.@(js|ts)`;
    before(() => {
        createTree(testDir, {
            "get.js": `
                module.exports = {
                    method: "get",
                    path: "/",
                    operationObject: { responses: [] },
                    handler: (_req, res) => {
                        res.status(200).send("GET /");
                    }
                };
            `,
            "post.js": `
                exports.default = {
                    method: "post",
                    path: "/",
                    operationObject: { responses: [] },
                    handler: (_req, res) => {
                        res.status(200).send("POST /");
                    }
                };
            `,
            pets: {
                "get.ts": `
                    export default {
                        method: "get",
                        path: "/pets",
                        operationObject: { responses: [] },
                        handler: (_req: any, res: any) => {
                            res.status(200).send("GET /pets");
                        }
                    };
                `
            }
        });
        glob.sync(convroutesPattern).forEach(decache);
    });
    after(() => {
        destroyTree(testDir);
    });

    it("can be automatically loaded from files matching a given pattern", async () => {
        const router = new Convexpress({
            baseOpenAPIObject: {
                openapi: "3.0.2",
                info: { title: "title", version: "1" }
            }
        })
            .loadConvroutesFrom(convroutesPattern)
            .generateRouter();

        const app = express().use(router);

        await request(app)
            .get("/")
            .expect(200)
            .expect("GET /");

        await request(app)
            .post("/")
            .expect(200)
            .expect("POST /");

        await request(app)
            .get("/pets")
            .expect(200)
            .expect("GET /pets");
    });
});

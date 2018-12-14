const express = require("express");

const convexpress = require("../../src");

module.exports = function getServer() {
    const options = {
        info: {
            title: "petstore",
            version: "1.0.0"
        },
        host: "localhost:8080"
    };
    const api = convexpress(options)
        .serveSwagger()
        .convroute({
            path: "/pets",
            method: "get",
            handler: (req, res) => {
                res.status(200).send([{ species: "dog" }, { species: "cat" }]);
            },
            tags: ["pets"],
            description: "Get pets",
            responses: {
                "200": {
                    description: "Pets list"
                }
            }
        })
        .convroute({
            path: "/pets",
            method: "post",
            handler: (req, res) => {
                res.status(201).send(req.body);
            },
            tags: ["pets"],
            description: "Create pet",
            parameters: [
                {
                    name: "pet",
                    in: "body",
                    required: true,
                    schema: {
                        type: "object",
                        properties: {
                            species: {
                                description: "Pet species",
                                type: "string"
                            }
                        },
                        additionalProperties: false,
                        required: ["species"]
                    }
                }
            ],
            responses: {
                "201": {
                    description: "Created pet species"
                }
            }
        });
    return express().use(api);
};

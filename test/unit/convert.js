import {expect} from "chai";
import {clone} from "ramda";

import convert, {parameters, path} from "../../src/convert";

describe("path", () => {
    it("converts from expressjs path syntax to swagger path syntax", () => {
        const expressPaths = [
            "/",
            "/user",
            "/user/:id",
            "/user/:id/",
            "/user/:id/:prop",
            "/user/:id/role",
            "/user/:id/role/",
            "/user/:id/role/:role"
        ];
        const swaggerPaths = [
            "/",
            "/user",
            "/user/{id}",
            "/user/{id}/",
            "/user/{id}/{prop}",
            "/user/{id}/role",
            "/user/{id}/role/",
            "/user/{id}/role/{role}"
        ];
        expect(expressPaths.map(path)).to.deep.equal(swaggerPaths);
    });
});

describe("parameters", () => {

    it("forces schema-less parameters into string parameters", () => {
        const inputParameters = [{}];
        expect(parameters(inputParameters)).to.deep.equal([{
            type: "string"
        }]);
    });

    it("converts parameters' json-schemas into swagger-schemas", () => {
        const inputParameters = [{
            schema: {
                id: "id",
                type: "string"
            }
        }];
        const outputParameters = parameters(inputParameters);
        expect(outputParameters[0].schema).to.deep.equal({
            type: "string"
        });
    });

    it("copies parameters' original json-schemas to the x-schema property", () => {
        const inputParameters = [{
            schema: {
                id: "id",
                type: "string"
            }
        }];
        const outputParameters = parameters(inputParameters);
        const originalSchema = inputParameters[0].schema;
        const copiedSchema = outputParameters[0]["x-schema"];
        expect(copiedSchema).to.deep.equal(originalSchema);
    });

});

describe("convertSchema", () => {

    const convertSchema = convert.__GetDependency__("convertSchema");

    describe("converts json-schemas into swagger-schemas", () => {

        it("schema with unsupported keywords", () => {
            const jsonSchema = {
                $schema: "http://json-schema.org/draft-04/schema#",
                anyOf: [],
                oneOf: [],
                not: {},
                definitions: {},
                id: "id"
            };
            expect(convertSchema(jsonSchema)).to.deep.equal({});
        });

        it("array with array items", () => {
            const jsonSchema = {
                type: "array",
                items: [{
                    id: "id",
                    type: "string"
                }]
            };
            expect(convertSchema(jsonSchema)).to.deep.equal({
                type: "array",
                items: [{
                    type: "string"
                }]
            });
        });

        it("array with object items", () => {
            const jsonSchema = {
                type: "array",
                items: {
                    id: "id",
                    type: "string"
                }
            };
            expect(convertSchema(jsonSchema)).to.deep.equal({
                type: "array",
                items: {
                    type: "string"
                }
            });
        });

        it("array with unsupported keywords", () => {
            const jsonSchema = {
                type: "array",
                items: {
                    id: "id",
                    type: "string"
                },
                additionalItems: {}
            };
            expect(convertSchema(jsonSchema)).to.deep.equal({
                type: "array",
                items: {
                    type: "string"
                }
            });
        });

        it("object with object additionalProperties", () => {
            const jsonSchema = {
                type: "object",
                properties: {},
                additionalProperties: {
                    id: "id",
                    type: "string"
                }
            };
            expect(convertSchema(jsonSchema)).to.deep.equal({
                type: "object",
                properties: {},
                additionalProperties: {
                    type: "string"
                }
            });
        });

        it("object with unsupported keywords", () => {
            const jsonSchema = {
                type: "object",
                properties: {},
                patternProperties: {},
                dependencies: {}
            };
            expect(convertSchema(jsonSchema)).to.deep.equal({
                type: "object",
                properties: {}
            });
        });

    });

    it("converts json-schemas into swagger-schemas recursively", () => {
        const jsonSchema = {
            $schema: "http://json-schema.org/draft-04/schema#",
            id: "id",
            type: "object",
            properties: {
                arrayWithArrayItems: {
                    type: "array",
                    items: [{
                        id: "id",
                        type: "string"
                    }]
                },
                arrayWithObjectItems: {
                    type: "array",
                    items: {
                        id: "id",
                        type: "string"
                    }
                },
                arrayWithUnsupportedKeywords: {
                    type: "array",
                    items: {
                        id: "id",
                        type: "string"
                    },
                    additionalItems: {}
                },
                objectWithObjectAdditionalProperties: {
                    type: "object",
                    properties: {},
                    additionalProperties: {
                        id: "id",
                        type: "string"
                    }
                },
                objectWithUnsupportedKeywords: {
                    type: "object",
                    properties: {},
                    patternProperties: {},
                    dependencies: {}
                }
            }
        };
        expect(convertSchema(jsonSchema)).to.deep.equal({
            type: "object",
            properties: {
                arrayWithArrayItems: {
                    type: "array",
                    items: [{
                        type: "string"
                    }]
                },
                arrayWithObjectItems: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                },
                arrayWithUnsupportedKeywords: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                },
                objectWithObjectAdditionalProperties: {
                    type: "object",
                    properties: {},
                    additionalProperties: {
                        type: "string"
                    }
                },
                objectWithUnsupportedKeywords: {
                    type: "object",
                    properties: {}
                }
            }
        });
    });

    it("doesn't convert object properties with unsupported keywords as key", () => {
        const jsonSchema = {
            type: "object",
            properties: {
                patternProperties: {},
                dependencies: {}
            },
            patternProperties: {},
            dependencies: {}
        };
        expect(convertSchema(jsonSchema)).to.deep.equal({
            type: "object",
            properties: {
                patternProperties: {},
                dependencies: {}
            }
        });
    });

    it("doesn't mutate the input object", () => {
        const jsonSchema = {
            type: "object",
            properties: {},
            patternProperties: {},
            dependencies: {}
        };
        const jsonSchemaClone = clone(jsonSchema);
        convertSchema(jsonSchema);
        expect(jsonSchema).to.deep.equal(jsonSchemaClone);
    });

});

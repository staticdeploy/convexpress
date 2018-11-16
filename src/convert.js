const swaggerUnsupportedKeywords = require("./swagger-unsupported-keywords");
const { clone, is, map } = require("ramda");

exports.path = function path(expressPath) {
    /*
    *   Converts path parameters from the expressjs format to the swagger
    *   format. Example:
    *
    *   /user/:id/roles/:role -> /user/{id}/roles/{role}
    */
    return expressPath.replace(/:(\w+)/g, "{$1}");
};

exports.convertSchema = function convertSchema(jsonSchema) {
    const swaggerSchema = { ...jsonSchema };
    if (jsonSchema.type === "object") {
        if (jsonSchema.properties) {
            // each property is a json-schema
            swaggerSchema.properties = map(
                convertSchema,
                jsonSchema.properties
            );
        }
        if (is(Object, jsonSchema.additionalProperties)) {
            // if `additionalProperties` is an object, it's a json-schema
            swaggerSchema.additionalProperties = convertSchema(
                jsonSchema.additionalProperties
            );
        }
    }
    if (jsonSchema.type === "array") {
        if (is(Array, jsonSchema.items)) {
            // if `items` is an array, it's an array of json-schemas
            swaggerSchema.items = map(convertSchema, jsonSchema.items);
        } else if (is(Object, jsonSchema.items)) {
            // if `items` is a plain object, it's a json-schema
            swaggerSchema.items = convertSchema(jsonSchema.items);
        }
    }
    swaggerUnsupportedKeywords.forEach(keyword => {
        delete swaggerSchema[keyword];
    });
    return swaggerSchema;
};

exports.parameters = function parameters(parameters = []) {
    /*
    *   If there a schema property in the parameter definition, that property
    *   can contain any valid json-schema. swagger however doesn't fully support
    *   json-schemas. Thus, to avoid generating an invalid swagger definition,
    *   we convert the json-schema to a swagger schema by recursively deleting
    *   unsupported properties.
    *
    *   If there's no schema property, then the parameter must be either in
    *   path, query, or headers. Therefore it'll certainly be a string, and we
    *   specify it to avoid validation errors for the swagger file that could
    *   occur if the user forgets to set the type property.
    */
    return parameters.map(
        param =>
            param.schema
                ? {
                      ...param,
                      // Clone the schema to avoid accidental mutations that may
                      // occur inside convertSchema. In fact, even though
                      // convertSchema should  not mutate its input, accidental
                      // mutations could result in incorrect validation (since
                      // it's the same schema object used by the validation
                      // function). So better be safe than sorry.
                      schema: exports.convertSchema(clone(param.schema)),
                      // Keep the full schema around, which could be useful for
                      // some consumers of the swagger definition
                      "x-schema": param.schema
                  }
                : {
                      ...param,
                      type: "string"
                  }
    );
};

exports.method = function method(method) {
    return method.toLowerCase();
};

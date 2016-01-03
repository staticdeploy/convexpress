export function path (expressPath) {
    /*
    *   Converts path parameters from the expressjs format to the swagger
    *   format. Example:
    *
    *   /user/:id/roles/:role -> /user/{id}/roles/{role}
    */
    return expressPath.replace(/:(\w+)/g, "{$1}");
}

export function parameters (parameters = []) {
    /*
    *   If the parameter has a schema property, replace it with an empty object.
    *   In the route definition the schema property can contain any valid
    *   json-schema, but swagger doesn't fully support json-schemas. To avoid
    *   issues we just replace the value with an empty object and copy the
    *   JSON schema under the "x-schema" property.
    */
    return parameters.map(param => param.schema ? {
        ...param,
        schema: {},
        "x-schema": param.schema
    } : param);
}

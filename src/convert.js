import {swaggerNotSupportedKeywords} from './swaggerNotSupportedKeywords';
import {intersection} from "ramda";

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
    *   issues we move unsupported keywords under the "x-schema" property.
    *
    *   If there's no schema property, then the parameter must be either in
    *   path, query, or headers. Therefore it'll certainly be a string, and we
    *   specify it to avoid validation errors for the swagger file that could
    *   occur if the user forgets to set the type property.
    */
    return parameters.map(param => {
        if (param.schema) {
            Object.keys(param.schema).forEach(current => {
                if (swaggerNotSupportedKeywords.indexOf(current) !== -1) {
                    if (!param["x-schema"]) {
                        param["x-schema"] = {};
                    }
                    param["x-schema"][current] = param.schema[current];
                    delete param.schema[current]
                }
            });
        } else {
            return {...param,
                type: "string"};
        }
        return param;
    });
}
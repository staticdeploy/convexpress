import {swaggerUnsupportedKeywords} from "./swaggerUnsupportedKeywords";

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
    *   issues we rename unsupported keywords with x-.
    *
    *   If there's no schema property, then the parameter must be either in
    *   path, query, or headers. Therefore it'll certainly be a string, and we
    *   specify it to avoid validation errors for the swagger file that could
    *   occur if the user forgets to set the type property.
    */
    const convertParameter = parameter => Object.keys(parameter).forEach(current => {
        if (parameter[current] instanceof Object) {
            console.log(parameter[current]);
            convertParameter(parameter[current]);
        } else if (swaggerUnsupportedKeywords.indexOf(current) !== -1) {
            parameter[`x-${current}`] = parameter[current];
            delete parameter[current];
        }
    });
    return parameters.map(param => {
        if (param.schema) {
            convertParameter(param.schema);
        } else {
            return {...param,
                type: "string"};
        }
        return param;
    });
}
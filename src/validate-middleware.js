import Ajv from "ajv";
import {identity, T} from "ramda";
import {hasBody} from "type-is";

const ajv = Ajv({allErrors: true});

function validateRequest (params, req) {
    return params
        .map(param => {
            // Extract the target to validate
            var target;
            if (param.in === "body") {
                target = (hasBody(req) ? req.body : undefined);
            } if (param.in === "path") {
                target = req.params[param.name];
            } if (param.in === "query") {
                target = req.query[param.name];
            } if (param.in === "header") {
                target = req.headers[param.name.toLowerCase()];
            }
            // Validate the target
            var valid;
            var error;
            if (param.required && target === undefined) {
                valid = false;
                error = {
                    message: `Missing required parameter ${param.name} in ${param.in}`
                };
            } else if (!param.required && target === undefined) {
                valid = true;
                error = null;
            } else {
                valid = param.validate(target);
                error = !valid ? {
                    message: `Validation failed for parameter ${param.name} in ${param.in}`,
                    details: param.validate.errors
                } : null;
            }
            return {valid, error};
        })
        .reduce((result, singleResult) => ({
            // Fail if any validation fails
            valid: result.valid && singleResult.valid,
            // Gather all validation errors
            errors: result.errors.concat(singleResult.error).filter(identity)
        }), {valid: true, errors: []});
}

export const responses = {
    "400": {
        description: "Validation failed"
    }
};
export function middleware (params = []) {
    // Decorate each parameter with a validation function
    params = params.map(param => ({
        ...param,
        validate: param.schema ? ajv.compile(param.schema) : T
    }));
    // Return the actual middleware
    return (req, res, next) => {
        const result = validateRequest(params, req);
        if (result.valid) {
            next();
        } else {
            res.status(400).send({
                message: "Validation failed",
                errors: result.errors
            });
        }
    };
}

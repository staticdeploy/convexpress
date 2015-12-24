import Ajv from "ajv";

const ajv = Ajv({allErrors: true});

function validateRequest (params, req) {
    return params
        .map(param => {
            var target;
            if (param.in === "body") {
                target = req.body;
            } if (param.in === "path") {
                target = req.params[param.name];
            } if (param.in === "query") {
                target = req.query[param.name];
            } if (param.in === "header") {
                target = req.headers[param.name];
            }
            const valid = (
                param.required ?
                param.validate(target) :
                (target ? param.validate(target) : true)
            );
            return {
                valid: valid,
                errors: valid ? [] : param.validate.errors
            };
        })
        .reduce((result, singleResult) => ({
            valid: result.valid && singleResult.valid,
            errors: result.errors.concat(singleResult.errors)
        }), {valid: true, errors: []});
}

export const responses = {
    "400": {
        description: "Validation failed"
    }
};
export function middleware (params = []) {
    params = params.map(param => ({
        ...param,
        validate: ajv.compile(param.schema ? param.schema : {type: "string"})
    }));
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

const { json } = require("body-parser");
const { hasBody } = require("type-is");

module.exports = function parseBody(options = {}) {
    const jsonMiddleware = json({
        limit: options.limit,
        strict: options.strict,
        verify: options.verify
    });
    return (req, res, next) => {
        const reqHasBody = hasBody(req);
        const reqBodyIsEmpty = parseInt(req.headers["content-length"]) === 0;

        /*
        *   If the request doesn't have a body or the body is empty, go on
        *   without setting `req.body`.
        */
        if (!reqHasBody || reqBodyIsEmpty) {
            return next();
        }

        /*
        *   Here the request has a non-empty body. If it's not json, send a 415
        *   error.
        */
        if (!req.is("json")) {
            return res.status(415).send({
                message: "Body must have Content-Type application/json"
            });
        }

        /*
        *   Here the request has a non-empty, json-encoded body. We delegate its
        *   handling to the body-parser's `json` middleware, though we
        *   interecept errors in order to always return a json response.
        */
        jsonMiddleware(req, res, err => {
            if (err) {
                let message;
                let statusCode;
                switch (err.type) {
                    case "charset.unsupported":
                        message = "Invalid JSON Charset";
                        statusCode = 415;
                        break;
                    case "encoding.unsupported":
                        message = "Invalid JSON Content-Encoding";
                        statusCode = 415;
                        break;
                    case "entity.parse.failed":
                        message = "Invalid JSON Syntax";
                        statusCode = 400;
                        break;
                    default:
                        req.log &&
                            req.log.error(err, "Unknown error parsing body");
                        message = "Internal server error";
                        statusCode = 500;
                        break;
                }
                return res.status(statusCode).send({ message });
            }
            next();
        });
    };
};

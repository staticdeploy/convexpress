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
        *   handling to the body-parser's `json` middleware. (If the body turns
        *   out to be incorrectly encoded - e.g. not a valid json string - the
        *   middleware will take care of sending an error back to the client)
        */
        jsonMiddleware(req, res, next);
    };
};

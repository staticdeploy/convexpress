/*
*   We use two different but very similar functions because express does a bit
*   of magic with function arities (fn.length). For instance, if a middleware
*   function has length 4, then it is assumed to be an error-handling
*   middleware[1] and is therefore treated differently. As far as I (pscanf)
*   know, the error-handling middleware should be the only case in which
*   function arity is taken into account by express. However, to play it safe,
*   we use a function with length 2 for the handler, and a function with length
*   3 for the middleware.
*
*   [1]: http://expressjs.com/en/guide/error-handling.html
*/

exports.handler = function handler(fn) {
    return async (req, res) => {
        try {
            await fn(req, res);
        } catch (err) {
            res.status(500).send({
                message: "Internal server error"
            });
            req.log && req.log.error(err, "Uncaught exception");
        }
    };
};

exports.middleware = function middleware(fn) {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            res.status(500).send({
                message: "Internal server error"
            });
            req.log && req.log.error(err, "Uncaught exception");
        }
    };
};

export function handler (fn) {
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
}

export function middleware (fn) {
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
}

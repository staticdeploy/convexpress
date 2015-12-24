export default function wrap (handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (err) {
            res.status(500).send({
                message: "Internal server error"
            });
            req.log && req.log.error(err, "Uncaught exception");
        }
    };
}

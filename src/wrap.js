export default function wrap (handler) {
    return (req, res) => {
        try {
            const ret = handler(req, res);
            ret.catch && ret.catch(err => {
                // Handle async exception
                req.log && req.log(err, "Uncaught exception");
                res.status(500).send("Internal server error");
            });
        } catch (err) {
            // Handle sync exception
            req.log && req.log(err, "Uncaught exception");
            res.status(500).send("Internal server error");
        }
    };
}

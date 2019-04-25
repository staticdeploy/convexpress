const React = require("react");

const withBaseUrl = require(`${process.cwd()}/core/withBaseUrl.js`);

module.exports = () => (
    <iframe className="api-frame" src={withBaseUrl("/api-docs/index.html")} />
);

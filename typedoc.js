module.exports = {
    excludePrivate: true,
    exclude: ["src/utils/*.ts", "src/middleware/*.ts"],
    theme: "minimal",
    mode: "file",
    readme: "none",
    hideGenerator: true,
    excludeExternals: true,
    name: "index",
    out: "docs/.vuepress/public/api-docs"
};

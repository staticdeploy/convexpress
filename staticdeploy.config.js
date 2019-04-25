const { join } = require("path");

const IS_DEPLOYING_LATEST_WEBSITE =
    process.env.DEPLOY_LATEST_WEBSITE === "true";
const BUNDLE_TAG = process.env.CIRCLE_TAG || process.env.CIRCLE_BRANCH;

module.exports = {
    bundle: {
        from: join(__dirname, "/website/build/convexpress"),
        name: "convexpress",
        tag: BUNDLE_TAG,
        description: `Bundle for commit ${process.env.CIRCLE_SHA1}`,
        fallbackAssetPath: "/notFound.html",
        fallbackStatusCode: 404,
        headers: {
            "**/*": {
                "Cache-Control": "public, max-age=86400"
            }
        }
    },
    deploy: {
        app: "convexpress",
        entrypoint: IS_DEPLOYING_LATEST_WEBSITE
            ? "convexpress.staticdeploy.io/"
            : `convexpress.staticdeploy.io/_/${BUNDLE_TAG}/`,
        bundle: `convexpress:${BUNDLE_TAG}`
    }
};

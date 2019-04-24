module.exports = {
    title: "convexpress",
    description: "Employ conventions to register express routes",
    themeConfig: {
        nav: [
            { text: "Home", link: "/" },
            { text: "Guide", link: "/guide/introduction" },
            { text: "Api", link: "/api" }
        ],
        sidebar: {
            "/guide/": [
                {
                    title: "Guide",
                    collapsable: false,
                    children: [
                        "introduction",
                        "quickstart",
                        "conventions",
                        "error-handling"
                    ]
                }
            ]
        },
        repo: "staticdeploy/convexpress"
    },
    markdown: {
        lineNumbers: true
    }
};

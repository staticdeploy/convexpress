const React = require("react");
const stripIndent = require("strip-indent");

// The following file is injected by docusaurus during the build, see
// https://docusaurus.io/docs/en/api-pages.html#page-require-paths for details
const { Container, GridBlock } = require("../../core/CompLibrary.js");
const withBaseUrl = require(`${process.cwd()}/core/withBaseUrl.js`);
const siteConfig = require(`${process.cwd()}/siteConfig.js`);

const Button = props => (
    <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
            {props.children}
        </a>
    </div>
);

const HomeSplash = () => (
    <div className="homeContainer homePage">
        <div className="homeSplashFade">
            <div className="wrapper homeWrapper">
                <div className="inner">
                    <h2 className="projectTitle">
                        {siteConfig.title}
                        <small>{siteConfig.tagline}</small>
                    </h2>
                    <div className="section promoSection">
                        <div className="promoRow">
                            <div className="pluginRowBlock">
                                <Button
                                    href={withBaseUrl(
                                        "/docs/getting-started-overview"
                                    )}
                                >
                                    {"get started"}
                                </Button>
                                <Button href="https://github.com/staticdeploy/convexpress">
                                    {"github"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MainFeaturesRow = () => (
    <Container padding={["bottom", "top"]}>
        <GridBlock
            align="center"
            contents={[
                {
                    image: withBaseUrl("/images/home.conventions.svg"),
                    imageAlign: "top",
                    title: "Conventions",
                    content: stripIndent(`
                        Have a conventional way to register your express routes.
                        Say goodbye to custom setups varying from project to
                        project
                    `)
                },
                {
                    image: withBaseUrl("/images/home.openapi.svg"),
                    imageAlign: "top",
                    title: "OpenAPI",
                    content: stripIndent(`
                        Bind your routes' behaviour to their OpenAPI definition,
                        so that it's always up-to-date and accurate
                    `)
                }
            ]}
            layout="twoColumn"
        />
    </Container>
);

module.exports = () => (
    <div className="homePage">
        <HomeSplash />
        <div className="mainContainer">
            <MainFeaturesRow />
        </div>
    </div>
);

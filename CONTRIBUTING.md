## Develop

> _System requirements_:
>
> - [nodejs](https://nodejs.org/en/) >= 8
> - [yarn](https://yarnpkg.com/en/) @ latest

To get started developing the service:

- clone the project
- install dependencies with `yarn install`

You can then run one of the following scripts:

- `yarn test`: runs unit tests
- `yarn test --watch`: runs unit tests and re-runs them on code changes
- `yarn coverage`: runs unit tests and calculates code coverage
- `yarn lint`: runs linters
- `yarn prettify`: formats the code with [prettier](https://prettier.io)
- `yarn compile`: compiles the TypeScript code into Javascript
- `yarn docs:dev`: starts the development server for the documentation website

## Conventions

- the project is written in TypeScript. Committing will fail if the code fails
  to compile

- commit messages must be formatted using the
  [conventional commit message guidelines](https://git.io/vAO73), committing
  will fail otherwise

- [prettier](https://prettier.io) is used to enforce code formatting. Committing
  will fail if the code isn't formatted as prettier dictates. You can fix code
  formatting by running yarn prettify, but installing the prettier extension for
  your editor of choice is highly recommended

- [tslint](https://palantir.github.io/tslint/) is used to check some common
  coding mistakes. Committing will fail if the tslint check fails

## Release

To release a new version:

- first of all, update CHANGELOG.md, and commit the update with message
  `docs: update CHANGELOG for vx.x.x`

- run `npm version x.x.x` to bump a new version of the package. The command will
  set the specified version number in `package.json`, commit the change, tag the
  commit with `vx.x.x`

- push the commit and the tag: `git push --tags origin master`

- if tests pass, the module will automatically be published

> **Note**: you can use convenience commands `npm version major`,
> `npm version minor`, `npm version patch` to bump the consecutive major / minor
> / patch version of the package.

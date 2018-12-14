## Development environment setup

To get started developing the library, clone the project and install
dependencies with [yarn](https://yarnpkg.com/). Then you can either:

- `yarn test`: runs unit tests
- `yarn test --watch`: runs unit tests, re-runs them on code changes
- `yarn coverage`: runs unit tests, calculates code coverage
- `yarn lint`: runs code linters (prettier + tslint)
- `yarn prettify`: formats code with prettier

> **NOTE**: this project uses [prettier](https://github.com/prettier/prettier)
> to enforce code formatting. Installing the prettier extension for your editor
> of choice is **highly recommended**.

## Release

- Run `npm version x.x.x` to bump a new version of the package. The command will
  set the specified version number in `package.json`, commit the change, tag the
  commit with `vx.x.x`

- Push the commit and the tag to github: `git push --tags origin master`

- If linting and automated tests pass, the module will automatically be
  published to npm

> **Note**: you can use convenience commands `npm version major`,
> `npm version minor`, `npm version patch` to bump the consecutive major / minor
> / patch version of the package.

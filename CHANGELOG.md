## 2.2.1 (March 22, 2018)

Fixes:

- return body-parsing errors as JSON (#13)
- remove `babel-polyfill` as peerDependency (#14)

Misc:

- update dependencies
- use `cross-env` in npm scripts to support all OS-es
- change single quotes in npm scripts to support all OS-es
- fix code example in README

## 2.2.0 (November 20, 2017)

Features:

- support default exports in `loadFrom`

## 2.1.1 (November 19, 2017)

Features:

- fix type definitions

## 2.1.0 (November 19, 2017)

Features:

- add TypeScript type definitions

## 2.0.0 (November 19, 2017)

Breaking changes:

- don't transpile source with babel, now works only on nodejs >= 8

Features:

- `loadFrom` method to load convroutes from files matching a pattern

## 1.5.0 (December 19, 2016)

Features:

- make it possible to configure the json body parser

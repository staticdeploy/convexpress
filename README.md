[![npm](https://badge.fury.io/js/convexpress.svg)](https://badge.fury.io/js/convexpress)
[![build status](https://img.shields.io/circleci/project/github/staticdeploy/convexpress.svg)](https://circleci.com/gh/staticdeploy/convexpress)
[![coverage](https://codecov.io/github/staticdeploy/convexpress/coverage.svg?branch=master)](https://codecov.io/github/staticdeploy/convexpress?branch=master)
[![dependencies](https://david-dm.org/staticdeploy/convexpress.svg)](https://david-dm.org/staticdeploy/convexpress)
[![devDependencies](https://david-dm.org/staticdeploy/convexpress/dev-status.svg)](https://david-dm.org/staticdeploy/convexpress#info=devDependencies)

# convexpress

Employ conventions to register express routes.

## Install

```sh
yarn add convexpress
```

> **Note**: this library requires nodejs >= 8

## Quickstart

### Define a convroute

```ts
// src/api/pets/get.ts
import { Convexpress } from "convexpress";

export default Convexpress.convroute({
  method: "get",
  path: "/pets",
  operationObject: {
    description: "List pets",
    tags: ["pets"],
    responses: {
      "200": {
        description: "pets list"
      }
    }
  },
  handler(_req, res) {
    res.status(200).send(["dog", "cat"]);
  }
});
```

### Init convexpress

```js
// src/server.ts
import express from "express";
import { Convexpress } from "convexpress";

import getPets from "./api/pets/get";

const convexpress = new Convexpress({
  openapi: "3.0.2",
  info: {
    title: "pet store",
    version: "1.0.0"
  }
})
  // Register the route
  .addConvroute(getPets)
  // Or register multiple routes at once
  .loadConvroutesFrom("./api/**/*.(ts|js)");

express()
  .use(convexpress.generateRouter())
  .listen(process.env.PORT);
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

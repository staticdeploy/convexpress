---
id: getting-started-quickstart
title: Quickstart
---

Define a convroute:

```ts
// src/api/pets/get.ts
import { convroute } from "convexpress";

export default convroute({
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

Init convexpress:

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

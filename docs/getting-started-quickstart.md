---
id: getting-started-quickstart
title: Quickstart
---

## Install

First of all, install express and convexpress:

```sh
yarn add express convexpress
```

Notice that you need to also install express, since it's a peer dependency of
convexpress.

## Write a convroute

```js
import { convroute } from "convexpress";

// The convroute function is just an identity function, but it's typed to accept
// a convroute object so it'll give you type-checking and autocompletion
export default convroute({
  method: "get",
  path: "/pets",
  operationObject: {
    tags: ["pets"],
    summary: "List all pets",
    responses: {
      "200": {
        description: "An array of pets",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                type: { type: "string" },
                name: { type: "string" }
              }
            }
          }
        }
      }
    }
  },
  handler(req, res) {
    res
      .status(200)
      .send([{ type: "cat", name: "Fufi" }, { type: "dog", name: "Miki" }]);
  }
});
```

convroutes can be placed anywhere on the filesystem. Possible directory
structures for convroutes are:

```sh
# Flat structure                            # Path-like structure
api/                                        api/
├── listPets.js                             └── pets
├── createPet.js                                ├── get.js
└── deletePet.js                                ├── post.js
                                                └── {pedId}/
                                                    └── delete.js
```

## Init convexpress and express

```js
import { Convexpress } from "convexpress";
import express from "express";

import listPets from "./api/listPets";

const convexpress = new Convexpress({
  openapi: "3.0.2",
  info: { title: "pet store", version: "1.0.0" }
})
  // Register the route directly
  .addConvroute(listPets)
  // Or register it by loading multiple routes at once
  .loadConvroutesFrom("./api/**/*.js");

express()
  .use(convexpress.generateRouter())
  .listen(process.env.PORT);
```

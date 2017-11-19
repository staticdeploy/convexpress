[![npm](https://badge.fury.io/js/convexpress.svg)](https://badge.fury.io/js/convexpress)
[![build](https://travis-ci.org/staticdeploy/convexpress.svg?branch=master)](https://travis-ci.org/staticdeploy/convexpress)
[![coverage](https://codecov.io/github/staticdeploy/convexpress/coverage.svg?branch=master)](https://codecov.io/github/staticdeploy/convexpress?branch=master)
[![dependencies](https://david-dm.org/staticdeploy/convexpress.svg)](https://david-dm.org/staticdeploy/convexpress)
[![devDependencies](https://david-dm.org/staticdeploy/convexpress/dev-status.svg)](https://david-dm.org/staticdeploy/convexpress#info=devDependencies)

# convexpress

Employ conventions to register express routes. This is done by creating route
definition objects - convroutes - which:

* register the route's method and path
* handle input validation
* document the route

## Install

`npm install --save convexpress`

## Use

### Define a route (convroute)

```js
/* File: src/api-root/pets/get.js */
import dbClient from "services/db";

export const path = "/pets";
export const method = "get";
export const description = "List pets";
export const tags = ["pets"];
export const responses = {
    "200": {
        description: "pets list"
    }
};
export const parameters = [{
    name: "status",
    description: "Filter by pet status (e.g. available / not available)"
    in: "query",
    required: false,
    type: "string",
}];
export async function handler (req, res) {
    const pets = await dbClient.query(
        `SELECT * FROM pets WHERE status = ${req.query.status}`
    );
    res.status(200).send(pets);
}
```

### Wire it all together

```js
/* File: src/server.js */
import express from "express";
import convexpress from "convexpress";

import * as petsGet from "api-root/pets/get";
import * as petsPost from "api-root/pets/post";

const options = {
    info: {
        title: "pet store",
        version: "1.0.0"
    },
    host: "localhost:3000"
};
const api = convexpress(options)
    // Serve swagger definition at /swagger.json
    .serveSwagger()
    .convroute(petsGet)
    .convroute(petsPost);

const server = express()
    .use(api)
    .listen(process.env.PORT)
```

## API

### convexpress(options)

Create an express router object (convrouter), which the additional methods
`convroute` and `serveSwagger`.

##### Arguments

* `options` **object**: top-level properties of the swagger definition
  * `host` **string**
  * `basePath` **string**
  * `info` **string**
  * `bodyParserOptions` **object**: options for the json body parser:
    * `limit` **string** (default `100kb`): maximum body size
      ([details](https://github.com/expressjs/body-parser#limit))
    * `strict` **boolean** (default `true`): strictly parse the json body
      ([details](https://github.com/expressjs/body-parser#strict))
    * `verify` **function**: a function that verifies the body
      ([details](https://github.com/expressjs/body-parser#verify))

##### Returns

The express router (convrouter).

### convrouter.convroute(convroute)

Registers a convroute.

##### Arguments

* `convroute` **object** _required_: a convroute definition object:
  * `path` **string** _required_
  * `method` **string** _required_
  * `handler` **function** _required__
  * `paramters` **Array< object >**
  * `middleware` **Array< function >**
  * `description` **string**
  * `tags` **Array< string >**
  * `responses` **Map< object >**

##### Returns

The convrouter, to allow for method chaining.

### convrouter.serveSwagger()

Registers the route `GET /swagger.json` for serving the swagger definition, and
the route `GET /swagger/` for serving the swagger UI html.

##### Arguments

None.

##### Returns

The convrouter, to allow for method chaining.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

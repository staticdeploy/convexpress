---
id: getting-started-overview
title: Overview
---

## What is convexpress

**convexpress** is a lightweight framework on top of
[express.js](https://expressjs.com), that defines an opinionated way to build
APIs.

## What problems it tries to solve

### Project organization

express is an un-opinionated framework that only provides a set of core
functionalities for handling http requests. **Developers using express have to
come up with ways to organize their code**, often ending up building small
frameworks on top of express. Things can get messier in a microservice
ecosystem, where each express project can end up with a different structure and
different sets of conventions.

convexpress was born as a set of common patterns used in organizing express
projects. Its main goal is to **provide a conventional way (hence the name) to
structure an express API**.

### Documentation

Most of the time, **if you're building an HTTP API, you should document it**. An
industry standard for doing so is [OpenAPI](https://openapis.org) (formerly
swagger).

convexpress **requires** you to document your API with OpenAPI, and _derives_
the implementation _from_ the documentation, ensuring that your documentation is
always correct and up-to-date.

## How it looks

In convexpress, the building block of an API is the **convroute**, an object
defining an HTTP method, a path, and a function that gets executed when a
request is made _with_ that method _to_ that path. **To build an API with
convexpress you just define a series of convroutes**.

Example convroute:

```js
export default {
  method: "get",
  path: "/pets",
  // OpenAPI documentation
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
};
```

When defining a convroute you're **required** to document it using the
[OpenAPI standard](https://www.openapis.org/). This allows convexpress to
generate an OpenAPI document for your API, and allows convexpress middleware to
use that documentation to implement functionalities like request validation and
authentication.

## Philosophy

convexpress **WANTS** to:

- **leverage the express API**: how do you read request params? How do you send
  a response? The same way you do it in express. convexpress doesn't provide any
  alternative API to do things, it's just express
- **include some batteries**: 95% of the APIs you're going to build with
  convexpress will be json APIs. convexpress wants to remove the glue you need
  to make them
- **promote a documentation-first approach**: the OpenAPI documentation should
  drive the behaviour of the service. For example, if for a certain route a
  query parameter is marked as required, a request not specifying that parameter
  should get a `400` response, **because** the documentation says so.
- **stay thin**: it shouldn't take you more than half an hour to read through
  the convexpress codebase and understand what it does

convexpress **DOESN'T WANT** to:

- **give alternative ways to do things**: the express API works well, is well
  documented, and everyone knows how it works and its gotchas
- **implement non "controller-related" functionalities**: things like dependency
  injection, healthchecks, logging, metrics, etc. convexpress might include
  middleware that makes it easy to use other tools providing those
  functionalities, but it will not _implement_ those functionalities

## Library structure

There are two main parts of convexpress:

- the core `Convexpress` class, through which you define the convroutes making
  up your API
- a selection of middleware implementing common functionalities, like validating
  request parameters and validating json requests bodies

Though you're not required to use any of the provided middleware, you'll
probably find yourself using many of them for most of your routes (if you don't,
convexpress might not be the right library for your use case).

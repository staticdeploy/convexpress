[![npm](https://badge.fury.io/js/convexpress.svg)](https://badge.fury.io/js/convexpress)
[![build](https://travis-ci.org/staticdeploy/convexpress.svg?branch=master)](https://travis-ci.org/staticdeploy/convexpress)
[![coverage](https://codecov.io/github/staticdeploy/convexpress/coverage.svg?branch=master)](https://codecov.io/github/staticdeploy/convexpress?branch=master)
[![dependencies](https://david-dm.org/staticdeploy/convexpress.svg)](https://david-dm.org/staticdeploy/convexpress)
[![devDependencies](https://david-dm.org/staticdeploy/convexpress/dev-status.svg)](https://david-dm.org/staticdeploy/convexpress#info=devDependencies)

# convexpress

Employ conventions to register express routes.

## `convroute` properties

* `path`
* `method`
* `handler`
* `paramters` (optional)
* `middleware` (optional)
* `description` (optional)
* `tags` (optional)
* `responses` (optional)

## Install
`$ npm install convexpress`

## Use

### Rouotes implementation

```js
import convexpress from 'convexpress';

const options = {
    info: {
        title: 'myService',
        version: '1.0.0'
    },
    host: 'localhost:3000'
};
const api = convexpress(options)
    .serveSwagger() //automatically generate swagger.json
    .convroute(require('./resourceA/get'))
    .convroute(require('./resourceA/post'))

const server = express()
    .use(cors(corsOptions))
    .use(bodyParser.json({limit: '6mb'}))
    .use(bodyParser.urlencoded({limit: '6mb', extended: true}))
    .use(api);
```

### Api implementation

####get.js
```js
export const path = '/resourceA';
export const method = 'get';
export const description = 'List resourceA';
export const tags = ['resourceA'];
export const responses = {
    '200': {
        description: 'resourceA list'
    }
};
export const parameters = [
    {
        name: 'id',
        in: 'query',
        required: false,
        type: 'string'
    }
];
export function handler (req, res) {
    // request handler, return all that client needs
}
```
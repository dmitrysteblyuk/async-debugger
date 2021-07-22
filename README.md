# Async Debugger

[![npm](https://img.shields.io/npm/v/async-debugger/latest.svg)](https://www.npmjs.com/package/async-debugger)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Babel plugin and utilities for running async code at breakpoints. Plus REPL console for debugger statements in Node.

## Installation

```bash
yarn add --dev async-debugger
```

## Problem

In JavaScript it is not possible to run async code when execution is paused at a breakpoint (e.g. with `debugger` statement).

Thus it is impossible to test any async logic in browser console when debugging/developing.

## Solution

Async Debugger pauses only async functions that are being debugged (have reached debugger statement) and does not block JS execution.

The access to the variables in the scope is ensured with a **babel plugin** it implements.

For example, this code below:

```javascript
const a = 'abc';
let b = 123;
await 'debugger';
```

will transpile to (n.b. the actual implementation is different):

```javascript
import {debugAsync} from 'async-debugger';

const a = 'abc';
let b = 123;
await debugAsync({a, b});
```

`debugAsync` in its turn will expose the variables to global object and REPL console in Node.

## Example

### Node

Create a file `server.js` as follows:

```javascript
const {createServer} = require('http');

const getAllUsers = () => Promise.resolve(
  [{id: 0, name: 'Luke'}, {id: 1, name: 'Leia'}, {id: 2, name: 'Chewie'}]
);
const getUserById = async (id) => {
  const allUsers = await getAllUsers();
  return allUsers.find((user) => user.id === id);
};

const server = createServer(async (request, response) => {
  try {
    const userId = +request.url.split('/').pop();
    const user = await getUserById(userId);

    await 'debugger'; // <-- it will await until REPL is closed.

    response.write(JSON.stringify(user));
  } catch (error) {
    response.statusCode = 500;
    response.write(String(error));
  } finally {
    response.end();
  }
});
server.listen(3000, () => console.log('Listening on', server.address()));
```

To enable Async Debugger you can run it like this:

```bash
node --require async-debugger/register --experimental-repl-await server.js
```

Then make a GET request to `http://localhost:3000/users/2` and use the REPL launched automatically in your terminal:

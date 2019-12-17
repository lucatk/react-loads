# React Loads

#### **React Loads is a backend agnostic library to help with external data fetching in your UI components.**

## Features

- **Hooks** and **Render Props** to manage your async states & response data
- **Backend agnostic.** Use React Loads with REST, GraphQL, or Web SDKs
- **Renderer agnostic.** Use React Loads with React DOM, React Native, React VR, etc
- **Automated caching & revalidation** to maximise user experience between page transitions
- **React Suspense** support
- **SSR** support
- **Preload** support to [implement the "render-as-you-fetch" pattern](#TODO)
- **Polling** support to load data every x seconds
- **Request deduping** to minimise over-fetching of your data
- **Focus revalidation** to re-fetch your data when the browser window is focused
- **Resources** to allow your to hoist common async functions for built-in caching & reusability
- **Finite set of state variables** to avoid cryptic ternaries and impossible states
- **External cache** support
- **Optimistic responses**

## Installation

```
yarn add react-loads
```

or npm:

```
npm install react-loads
```

## Quick start

### With Hooks

```jsx
import React from 'react';
import { useLoads } from 'react-loads';

async function fetchRandomDog() {
  // Dog fetcher logic here!
  // You can use any type of backend here - REST, GraphQL, you name it!
}

export default function RandomDog() {
  const { response, error, isPending, isResolved, isRejected } = useLoads('randomDog', fetchRandomDog);
  return (
    <div>
      {isPending && 'Loading...'}
      {isResolved && <img src={response.imgSrc} />}
      {isRejected && `Oh no! ${error.message}`}
    </div>
  )
}
```

The `useLoads` function accepts three arguments: a **context key**, an **async function**, and a **config object** (not used in this example). The **context key** will store the response of the `fetchRandomDog` function in the React Loads cache against the key. The **async function** is a function that returns a promise, and is used to fetch your data.

The `useLoads` function also returns a set of values: `response`, `error`, and a finite set of states (`isIdle`, `isPending`, `isResolved`, `isRejected`, and a few others). If your **async function** resolves, it will update the `response` & `isResolved` values. If it rejects, it will update the `error` value.

> IMPORTANT NOTE: You must provide useLoads with a memoized promise (via `React.useCallback` or **bounded outside of your function component as seen in the above example**), otherwise useLoads will be invoked on every render.
>
> If you are using `React.useCallback`, the [`react-hooks` ESLint Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks) is incredibly handy to ensure your hook dependencies are set up correctly.

### With Render Props

If your codebase isn't quite hook ready yet, React Loads provides a Render Props interface which shares the same API as the hook:

```jsx
import React from 'react';
import { Loads } from 'react-loads';

async function fetchRandomDog() {
  // Dog fetcher logic here!
  // You can use any type of backend here - REST, GraphQL, you name it!
}

class RandomDog extends React.Component {
  render() {
    return (
      <Loads context="randomDog" load={fetchRandomDog}>
        {({ response, error, isPending, isResolved, isRejected }) => (
          <div>
            {isPending && 'Loading...'}
            {isResolved && <img src={response.imgSrc} />}
            {isRejected && `Oh no! ${error.message}`}
          </div>
        )}
      </Loads>
    )
  }
}
```

### More examples

- [Basic](#TODO)
- [Top movies](#TODO)
- [Resources](#TODO)
- [Typescript](#TODO)
- [Render-as-you-fetch]()
  - [Basic](#TODO)
  - [Resources](#TODO)
- [Stories](#TODO)

## Guides

### Starting out

There are two main hooks: `useLoads` & `useDeferredLoads`.

- `useLoads` is called on first render,
- `useDeferredLoads` is called when you choose to invoke it (it's deferred until later).

Let's focus on the `useLoads` hook for now, we will explain `useDeferredLoads` in the next section.

The `useLoads` hook accepts 3 parameters:

- A [**"context key"**](#TODO) in the form of a **string**.
  - It will help us with identifying/storing data, deduping your requests & updating other `useLoad`'s sharing the same context
  - Think of it as the namespace for your data
- An [**"async function"**](#TODO) in the form of a **function that returns a promise**
  - This will be the function to resolve the data
- An optional [**"config"**](#TODO) in the form of an **object**

```jsx
import React from 'react';
import { useLoads } from 'react-loads';

async function fetchRandomDog() {
  // Dog fetcher logic here!
  // You can use any type of backend here - REST, GraphQL, you name it!
}

export default function RandomDog() {
  const {
    response,
    error,
    load,
    isPending,
    isReloading,
    isResolved,
    isRejected
  } = useLoads('randomDog', fetchRandomDog);
  return (
    <div>
      {isPending && 'Loading...'}
      {isResolved && (
        <div>
          <img src={response.imgSrc} />
          <button onClick={load} disabled={isReloading}>Load another</button>
        </div>
      )}
      {isRejected && `Oh no! ${error.message}`}
    </div>
  )
}
```

The `useLoads` hook represents a finite state machine and returns a set of state variables:

- `isIdle` if the async function hasn't been invoked yet (relevant for `useDeferredLoads`)
- `isPending` for when the async function is loading
- `isReloading` for when the async function is reloading (typically when `load` is manually invoked, or data exists in the cache)
- `isResolved` for when the async function has resolved
- `isRejected` for when the async function has errored

It also returns a `response` variable if your function resolves, and an `error` variable if rejected.

If you want to reload your data, `useLoads` also returns a `load` variable, which you can invoke.

The `useLoads` hook returns [some other variables](#TODO) as well.

### Deferring

Sometimes you don't want your async function to be invoked straight away. This is where the `useDeferredLoads` hook can be handy. It waits until you manually invoke it.

```jsx
import React from 'react';
import { useLoads } from 'react-loads';

async function fetchRandomDog() {
  // Dog fetcher logic here!
  // You can use any type of backend here - REST, GraphQL, you name it!
}

export default function RandomDog() {
  const {
    response,
    error,
    load,
    isPending,
    isReloading,
    isResolved,
    isRejected
  } = useDeferredLoads('randomDog', fetchRandomDog);
  return (
    <div>
      {isIdle && <button onClick={load}>Load a dog</button>}
      {isPending && 'Loading...'}
      {isResolved && (
        <div>
          <img src={response.imgSrc} />
          <button onClick={load} disabled={isReloading}>Load another</button>
        </div>
      )}
      {isRejected && `Oh no! ${error.message}`}
    </div>
  )
}
```

In the above example, the dog image is fetched via the `load` variable returned from `useDeferredLoads`.

There are also some cases where including a **context key** may not make sense. You can omit it if you want like so:

```js
const { ... } = useDeferredLoads(fetchRandomDog);
```

### Configuration

TODO

### Variables

If your async function needs some dependant variables (such as an ID or query parameters), use the `variables` attribute in the `useLoads` config:

```jsx
async function fetchDog(id) {
  return axios.get(`https://dog.api/${id}`);
}

export default function DogImage(props) {
  const { ... } = useLoads('dog', fetchDog, { variables: [props.id] });
}
```

The `variables` attribute accepts an array of values. If your async function accepts more than one argument, you can pass through just as many values to `variables` as the function accepts:

```jsx
async function fetchDog(id, foo, bar) {
  // id = props.id
  // foo = { hello: 'world' }
  // bar = true
  return axios.get(`https://dog.api/${id}`);
}

export default function DogImage(props) {
  const { ... } = useLoads('dog', fetchDog, {
    variables: [props.id, { hello: 'world' }, true]
  });
}
```

#### WARNING!

It may be tempting to not use the `variables` attribute at all, and just use the dependencies outside the scope of the function itself. While this works, it will probably produce unexpected results as the cache looks up the record against the **context key (`'dog'`)** and the set of **`variables`**. However, in this case, it will only look up the record against the `'dog'` context key meaning that every response will be stored against that key.

```jsx
// DON'T DO THIS! IT WILL CAUSE UNEXPECTED RESULTS!

export default function DogImage(props) {
  const id = props.id;
  const fetchDog = React.useCallback(() => {
    return axios.get(`https://dog.api/${id}`);
  })
  const { ... } = useLoads('dog', fetchDog);
}
```

### Conditional loaders

If you want to control when `useLoads` invokes it's async function via a variable, you can use the `defer` attribute in the config.

```jsx
export default function RandomDog(props) {
  // Don't fetch until shouldFetch is truthy.
  const { ... } = useLoads('randomDog', fetchRandomDog, {
    defer: !props.shouldFetch
  });
}
```

### Dependant loaders

There may be a case where one `useLoads` depends on the data of another `useLoads`, where you don't want subsequent `useLoads` to invoke the async function until the first `useLoads` resolves.

If you pass a function to `variables` and the function throws (due to `dog` being undefined), then the async function will be deferred while it is undefined. As soon as `dog` is defined, then the async function will be invoked.

```jsx
export default function RandomDog(props) {
  const { response: dog } = useLoads('dog', fetchDog);
  const { response: friends } = useLoads('dogFriends', fetchDogFriends, {
    variables: () => [dog.id]
  })
}
```

### Caching

Caching in React Loads comes for free with no initial configuration. React Loads uses the "stale while revalidate" strategy, meaning that `useLoads` will serve you with cached (stale) data, while it loads new data (revalidates) in the background, and then show the new data (and update the cache) to the user.

#### Caching strategy

React Loads uses the `context` argument given to `useLoads` to store the data in-memory against a **"cache key"**. If `variables` are present, then React Loads will generate a hash and attach it to the **cache key**. In a nutshell, **`cache key = context + variables`**.

```jsx
// The response of this will be stored against a "cache key" of `dog.1`
const { ... } = useLoads('dog', fetchDog, { variables: [1] });
```

React Loads will automatically revalidate whenever the cache key (`context` or `variables`) changes.

```jsx
// The fetchDog function will be fetched again if `props.context` or `props.id` changes.
const { ... } = useLoads(props.context, fetchDog, { variables: [props.id] });
```

You can change the caching behaviour by specifying a [`cacheStrategy` config option](#TODO). By default, this is set to `"context-and-variables"`, meaning that the cache key will be a combination of the `context` + `variables`.

```jsx
// The response of this will be stored against a `dog` key, ignoring the variables.
const { ... } = useLoads('dog', fetchDog, { cacheStrategy: 'context-only', variables: [props.id] });
```


#### Stale data & revalidation

By default, React Loads automatically revalidates data in the cache after **5 minutes**. That is, when the `useLoads` is invoked and React Loads detects that the data is stale (hasn't been updated for 5 minutes), then `useLoads` will invoke the async function and update the cache with new data. You can change the revalidation time using the [`revalidateTime` config option](#TODO).

```jsx
// Set it globally:
import { setConfig } from 'react-loads';
setConfig({
  revalidateTime: 600000
});

// Or, set it locally:
export default function RandomDog() {
  const { ... } = useLoads('randomDog', fetchRandomDog, { revalidateTime: 600000 });
}
```

#### Cache expiry

React Loads doesn't set a cache expiration by default. If you would like to set one, you can use the [`cacheTime` config option](#TODO).

```jsx
// Set it globally:
import { setConfig } from 'react-loads';
setConfig({
  cacheTime: 600000
});

// Or, set it locally:
export default function RandomDog() {
  const { ... } = useLoads('randomDog', fetchRandomDog, { cacheTime: 600000 });
}
```

### Slow connections

On top of the `isPending` & `isReloading` states, there are substates called `isPendingSlow` & `isReloadingSlow`. If the request is still pending after 5 seconds, then the `isPendingSlow`/`isReloadingSlow` states will become truthy, allowing you to indicate to the user that the request is loading slow.

```jsx
export default function RandomDog() {
  const { isPending, isPendingSlow } = useLoads('randomDog', fetchRandomDog);
  return (
    <div>
      {isPending && `Loading... ${isPendingSlow && 'Taking a while...'}`}
    </div>
  )
}
```

By default, the timeout is **5 seconds**, you can change this with the [`timeout` config option](#TODO).

### Polling

React Loads supports request polling (reload data every `x` seconds) with the [`pollingInterval` config option](#TODO).

```jsx
// Calls fetchRandomDog every 3 seconds.
const { ... } = useLoads('randomDog', fetchRandomDog, { pollingInterval: 3000 });
```

### Deduping

By default, all your requests are deduped on an interval of **500 milliseconds**. Meaning that if React Loads sees more than one request of the same cache key in under 500 milliseconds, it will not invoke the other requests. You can change the deduping interval with the [`dedupingInterval` config option](#TODO).

### Suspense

To use React Loads with Suspense, you can set the [`suspense` config option](#TODO) to `true`.

```jsx
// Set it globally:
import { setConfig } from 'react-loads';
setConfig({
  suspense: true
});

// Or, set it locally:
export default function RandomDog() {
  const { ... } = useLoads('randomDog', fetchRandomDog, { suspense: true });
}
```

Once enabled, you can use the `React.Suspense` component to replicate the `isPending` state, and use [error boundaries]() to display error states.

```jsx
function RandomDog() {
  const { response } = useLoads('randomDog', fetchRandomDog, { suspense: true });
  return <img src={response.imgSrc} />;
}

function App() {
  return (
    <React.Suspense fallback={<div>loading...</div>}>
      <RandomDog />
    </React.Suspense>
  )
}
```

### Optimistic responses

React Loads has the ability to optimistically update your data while it is still waiting for a response (if you know what the response will potentially look like). Once a response is received, then the optimistically updated data will be replaced by the response. [This article](https://uxplanet.org/optimistic-1000-34d9eefe4c05) explains the gist of optimistic UIs pretty well.

The `setResponse` function is provided in a `meta` object as seen below.

```jsx
import React from 'react';
import * as Loads from 'react-loads';

async function fetchDog(id) {
  // Fetch the dog
}

function updateDog(id, data) {
  return async meta => {
    meta.setResponse(data);
    // Fetch the dog
  }
}

export default function RandomDog(props) {
  const dogLoader = Loads.useLoads('dog', fetchDog, { variables: [props.id] });

  const updateDogLoader = Loads.useDeferredLoads('dog', updateDog);

  return (
    <div>
      {isPending && 'Loading...'}
      {isResolved && <img src={response.imgSrc} />}
      {isRejected && `Oh no! ${error.message}`}
      <button
        onClick={() => updateDogLoader.load(props.id, { imgSrc: 'cooldog.png' })}
      >
        Update dog
      </button>
    </div>
  )
}
```

### Resources

For async functions which may be used & invoked in many parts of your application, it may make sense to hoist and encapsulate them into resources.
A resource consists of one (or more) async function as well as a context.

Below is an example of a resource and it's usage:

```jsx
import React from 'react';
import * as Loads from 'react-loads';

// 1. Define your async function.
async function getUsers() {
  const response = await fetch('/users');
  const users = await response.json();
  return users;
}

// 2. Create your resource, and attach the loading function.
const usersResource = Loads.createResource({
  context: 'users',
  load: getUsers
});

function MyComponent() {
  // 3. Invoke the useLoads function in your resource.
  const getUsersLoader = usersResource.useLoads();

  // 4. Use the loader variables:
  const users = getUsersLoader.response || [];

  return (
    <div>
      {getUsersLoader.isPending && 'loading...'}
      {getUsersLoader.isResolved && (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

You can attach more than one loading function to a resource. **But it's return value must be the same schema, as every response will update the cache.**

You can also provide an array of 2 items to the resource creator (seen below with `delete`); the first item being the async function, and the second being the [config](#TODO).

Here is an extended example using a resource with multiple async functions, split into two files (`resources/users.js` & `index.js`):

#### `resources/users.js`
```jsx
import * as Loads from 'react-loads';

async function getUser(id) {
  const response = await fetch(`/users/${id}`);
  const user = await response.json();
  return user;
}

function updateUser(id, data) {
  return async meta => {
    await fetch(`/users/${id}`, {
      method: 'post',
      body: JSON.stringify(data)
    });
    // `cachedRecord` is the record that's currently stored in the cache.
    const currentUser = meta.cachedRecord.response;
    const updatedUser = { ...currentUser, ...data };
    return updatedUser;
  }
}

async function deleteUser(id) {
  await fetch(`/users/${id}`, { method: 'delete' });
  return;
}

export default Loads.createResource({
  context: 'user',
  load: getUser,
  // You can supply either a async function, or an array of async function/config pairs.
  update: [updateUser, { timeout: 3000 }],
  delete: deleteUser
});
```

#### `index.js`

```jsx
import React from 'react';

import DeleteUserButton from './DeleteUserButton';
import UpdateUserForm from './UpdateUserForm';
import usersResource from './resources/users';

function MyComponent(props) {
  const { userId } = props;

  const getUserLoader = usersResource.useLoads({
    variables: [userId]
  });
  const user = getUserLoader.response || {};

  const updateUserLoader = usersResource.update.useDeferredLoads({ variables: [userId] });
  const deleteUserLoader = usersResource.delete.useDeferredLoads({ variables: [userId] });

  return (
    <div>
      {getUserLoader.isPending && 'loading...'}
      {getUserLoader.isResolved && (
        <div>
          Username: {user.name}

          <DeleteUserButton
            isLoading={deleteUserLoader.isPending}
            onClick={deleteUserLoader.load}
          />

          <UpdateUserForm onSubmit={data => updateUserLoader.load(userId, data)} />
        </div>
      )}
    </div>
  )
}
```

Check out a [full example here](#TODO)

### Preloading

TODO

### External cache providers

If you would like the ability to persist response data upon unmounting the application (e.g. page refresh or closing window), a cache provider can also be utilised to cache response data.

Here is an example using [Store.js](https://github.com/marcuswestin/store.js/). You can either set the external cache provider on a global level or a `useLoads` level.

#### On a global level

```jsx
import { setConfig } from 'react-loads';
import store from 'store';

const cacheProvider = {
  get: key => store.get(key),
  set: (key, val) => store.set(key, val),
  reset: () => store.clearAll()
}

setConfig({
  cacheProvider
});
```

#### On a `useLoads` level

```jsx
import { useLoads } from 'react-loads';
import store from 'store';

const cacheProvider = {
  get: key => store.get(key),
  set: (key, val) => store.set(key, val),
  reset: () => store.clearAll()
}

export default function RandomDog() {
  const { ... } = useLoads('randomDog', fetchRandomDog, { cacheProvider });
}
```

## API

## Happy customers

## Acknowledgments

## License

MIT

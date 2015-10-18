# react-router-assembly

React Router Assembly (RRA) configures [React](https://facebook.github.io/react/) and [React Router](http://https://github.com/rackt/react-router) on top of [Express](http://expressjs.com/) for easy server- and client-side rendering. It assumes mostly separate server- and client-side logic for gathering data required for rendering views but helps sharing some of it if needed. It relies on convention, not configuration.

## How to setup
React Router Assembly will add a route to Express, so make sure its function is run before error handling. For details, see the example inside the repo.

### The most basic setup is:
```javascript
attachReactRoute({
	app: <Express app>,
	doneCallback: <callback once route ready, should configure error handling and launch the server here>
});
```

### All configuration options:
All paths are relative to run path, not the library path.

- `app` - Reference to Express app.
- `doneCallback` - Run after assembly is setup.
- `routesElementPath` - Path to React Router's route configuration.
- `serverPropsGeneratorPath` - Path to module gathering data on the server-side for routes. Route handlers can return promises returning a arrays of objects containing props that will be injected into route components or such structures directly.
- `clientPropsPath` - Path to module gathering data on the client-side. Only array of props objects or a function immediately returning such a structure can be returned here unlike with the serverPropsGenerator, as we want the interface to respond to user actions as fast as possible. If needed, wrap React Router components inside a preloader component using /helpers/propsPreloaderWrapper to display a loading animation or make such a component on your own.
- `isomorphicLogicPath` - Path to module that will be referenced when creating client and server props sets. Can be used to store logic needed on the client and server as serverProps for paths are serialised and will lose any contained functions.
- `templatePath` and `additionalTemplateProps` - Can be used for rendering React in a custom way. [Handlebars](http://handlebarsjs.com/) templating engine is used.
```

## Notes
- When run, RRA uses Browserify to generate a single JavaScript file for use on the client-side. This file is attached to the default template used for rendering React pages.
- Why do serverPropsGenerator and clientProps need to return arrays? Props on the whole path can change, this is a personal preference. If a more general component needs to change based on subpaths, this pattern allows it. An alternative would be to attach logic to specific components (using `static` and react to different React Router states there).

TODO: propsPreloaderWrapper description



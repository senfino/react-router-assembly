# react-router-assembly

Currently, only `assembly.modes.BUILD` and `assembly.modes.BUILD_AND_WATCH` are the available `modes`.



React Router Assembly (RRA) configures [React](https://facebook.github.io/react/) and [React Router](http://https://github.com/rackt/react-router) on top of [Express](http://expressjs.com/) for easy server- and client-side rendering. It assumes mostly separate server- and client-side logic for gathering data required for rendering views but helps sharing some of it if needed. It relies on convention, not configuration.

## How to setup
React Router Assembly will add a route to Express, so make sure its function is run before error handling. For details, see the example inside the repo.

### The most basic setup is:
#### Minify source files for the front-end
```javascript
assembly.build({
	clientPropsPath: './routing/clientProps',
	routesElementPath: routesElementPath,
	isomorphicLogicPath: isomorphicLogicPath,
	extraCompress: process.env.NODE_ENV,
	mode: assembly.modes.BUILD_AND_WATCH,
	onChange: function(){
		console.log('scripts changed');
	},
	onUpdate: function(attach){
		console.log('scripts updated');

		restartServer();
	}
});
```

#### Attach RRA to Express
```javascript
assembly.attach({
	app: app,
	routesElementPath: routesElementPath,
	serverPropsGeneratorPath: './routing/serverPropsGeneratornerator',
	isomorphicLogicPath: isomorphicLogicPath,
	onComplete: setupRest
});
```

**For convenience, I've created a small library called `server-creator` that can fork a Node file. RRA and `server-creator` combined have the capabilities of restarting a server when source files have changed. They're not intelligent enough to process SASS, sprites etc. but for React logic they're enough.**

<!--
```javascript
attachReactRoute({
	app: <Express app>,
	doneCallback: <callback once route ready, should configure error handling and launch the server here>
});
```
-->

### All configuration options:
All paths are relative to run path, not the library path.

<!--
- `app` - Reference to Express app.
- `doneCallback` - Run after assembly is setup.
- `routesElementPath` - Path to React Router's route configuration.
- `serverPropsGeneratorPath` - Path to module gathering data on the server-side for routes. Route handlers can return promises returning a arrays of objects containing props that will be injected into route components or such structures directly.
- `serverPropsGenerator` - Direct module reference, takes precedence over `serverPropsGeneratorPath`.
- `clientPropsPath` - Path to module gathering data on the client-side. Only an array of props objects or a function immediately returning such a structure can be returned here unlike with the serverPropsGenerator, as we want the interface to respond to user actions as fast as possible.
- `isomorphicLogicPath` - Path to module that will be referenced when creating client and server props sets. Can be used to store logic needed on the client and server as serverProps for paths are serialised and will lose any contained functions.
- `templatePath` and `additionalTemplateProps` - Can be used for rendering React in a custom way. [Handlebars](http://handlebarsjs.com/) templating engine is used.
- `compressFrontScript` - Remove parts of code intended for development to decrease the size of the front-end script.
-->
## Notes
- When run, RRA uses Browserify to generate a single JavaScript file for use on the client-side. This file is attached to the default template used for rendering React pages.
- Why do serverPropsGenerator and clientProps need to return arrays? This is a personal preference. Props on the whole path can change and if a more general component needs to change based on subpaths, this pattern allows it. An alternative would be to attach logic to specific components (using `static` and react to different React Router states there) - an approach shown in the documentation for React Router.
- IMPORTANT: Watchify is used to regenerate the browserify bundle. It will not find new files added to the project's directory and generate the Browserify bundle because of this. Most of the time this is not a big issue but if you need this kind of functionality (for example you dinamically load all modules inside a directory) then you have to implement the bundling process on your own (the attachment part can still be used though).






```html
<!DOCTYPE html>
<html>
<head>
    <title>{{{pageTitle}}}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link rel="stylesheet" type="text/css" href="/styles/main.css">
    <script type="text/javascript">
        var serverProps = {{{serverProps}}};
    </script>
    <script type="text/javascript" src="/scripts/main.generated.js"></script>
</head>
<body>
    <div id="base">{{{content}}}</div>
</body>
</html>
```

The following

```html
	<div id="base">{{{content}}}</div>
```

```html
<script type="text/javascript">
    var serverProps = {{{serverProps}}};
</script>
```

are required for the library to work correctly. To be specific, there has to be an element with "base" id with {{{content}}} rendered inside and a global serverProps variable receiving {{{serverProps}}} object.



This module cannot be used with `npm link` when react is used in parent also.


If extraCompress is set to true, JavaScript will be compressed with uglify and "dead" paths removed from code. This is especially effective with React, as it contains a lot of extra debugging code.
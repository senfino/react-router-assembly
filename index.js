'use strict';

function addReactRoute(app, routesElement, serverPropsGenerator, additionalTemplateProps){
  /*
  This should be the last route. It catches everything and tries to render a 
  React page. React will decide whether to display 404 or expected content.
  Static files in particular should be handled before this route.
  */
  app.get('*', function(request, response, next) {
    let createLocation = require('history/lib/createLocation');
    let location = createLocation(request.url);
    let Router = require('react-router');
    let match = Router.match;
    let React = require('react');
    let _ = require('lodash');
    let wrapInRouteClass = require('./wrapInRouteClass');

    match({routes: routesElement(wrapInRouteClass), location: location}, function(error, redirectLocation, renderProps){
      console.log(JSON.stringify(renderProps, null, 2));
      if (redirectLocation){
        response.redirect(301, redirectLocation.pathname + redirectLocation.search);
      }else if(error){
        response.status(500).send(error.message);
      }else if(renderProps == null){ // let react handle this case as well
        response.status(404).send('Not found');
      }else{
        let requestedRouteParts = renderProps.routes.map(function(route){return route.path});
        let SerializableKeySet = require('serializable-key-set');
        let routePropsDownloader = require('./routePropsDownloader');

        console.log('getting props on the server for ' + JSON.stringify(requestedRouteParts));

        routePropsDownloader(
          serverPropsGenerator.get(requestedRouteParts), 
          renderProps
        )
        .then(function(serverPropsForRoute){
          try{
            let _ = require('lodash');
            let RoutingContext = Router.RoutingContext;
            let React = require('react');
            let reactDOMString;

            console.log('rendering react components on the server to string');

            renderProps.routes.forEach(function(routePart, routePartIndex){
              _.assign(routePart, {serverProps: serverPropsForRoute[routePartIndex]});
            });

            reactDOMString = React.renderToString(React.createElement(RoutingContext, renderProps));

            console.log('rendering handlebars response with react embedded');

            response.render('react-page.handlebars', _.assign({
              content: reactDOMString,
              serverProps: JSON.stringify(serverPropsForRoute)
            }, additionalTemplateProps));
          }catch(error){
            next(error);
          }
        }, function(error){

          if(error instanceof Error){
            next(error);
          }else{
            next(new Error('could not retrieve all state values, try again'));
          }
        })
        .done();
      }
    });
  });
};

module.exports = addReactRoute;
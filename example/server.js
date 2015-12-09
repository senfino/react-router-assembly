#!/usr/bin/env node

/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-12-09 23:16:58
 */

'use strict';

let assembly;
let routesElementPath;
let isomorphicLogicPath;
let serverInstance = null;
let restartOnNextShutdown = false;

function restartServer(){
  let control;

  if(serverInstance !== null){
    restartOnNextShutdown = true;
    serverInstance.destroy();
  }else{
    control = require('server-creator');

    // fork here
    serverInstance = control.create({
      path: './express',
      onOffline: function(){
        serverInstance = null;

        if(restartOnNextShutdown){
          restartOnNextShutdown = false;
          restartServer();
        }
      }
    });
  }
}

assembly = require('../index');

routesElementPath = './routing/routes';
isomorphicLogicPath = './routing/isomorphicLogic';

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
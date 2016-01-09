'use strict';

var { Class }             = require('sdk/core/heritage');
var { Cc, Ci, Cu, Cm }    = require('chrome');
var xpcom                 = require('sdk/platform/xpcom');
var categoryManager       = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);

var ds                    = require('sdk/fs/path').sep;
//var currDir               = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIDirectoryServiceProvider).getFile("CurWorkD", {}).path;
var profilePath           = require('sdk/system').pathFor('ProfD');

var fileIO                = require('sdk/io/file');
var downloader            = require('./downloader');
var contractId            = "@backage.com/Interceptor;1";

var Interceptor = Class({
  extends:  xpcom.Unknown,
  interfaces: [ 'nsIContentPolicy' ],
  get wrappedJSObject() this,

    shouldLoad: function dt_shouldLoad(contentType, contentLocation, requestOrigin, node, mimeTypeGuess, extra) {

        if(contentType == Ci.nsIContentPolicy.TYPE_SCRIPT && node.nodeName == '#document' && contentLocation.host != 'pdf.js' && requestOrigin.host != 'pdf.js') {
            return Ci.nsIContentPolicy.REJECT_OTHER;
        }

        if(contentType == Ci.nsIContentPolicy.TYPE_SCRIPT && node instanceof Ci.nsIDOMHTMLScriptElement && node.hasAttribute('data-backage-name') ) {
            
            var packageName = node.getAttribute('data-backage-name');
            var version = '';

            if(node.hasAttribute('data-backage-version')){
              version = node.getAttribute('data-backage-version');
            }
    
            var replaced = this.replacement(node, packageName, version);

            if(replaced) {
                return Ci.nsIContentPolicy.REJECT_OTHER;
            } else {
                return Ci.nsIContentPolicy.ACCEPT;
            }

        }
        else{
            return Ci.nsIContentPolicy.ACCEPT;
        }

    },

    shouldProcess: function () {
      return Ci.nsIContentPolicy.ACCEPT;
    },

    replacement: function (node, packageName, version) {

        var self = require('sdk/self');
        var found, scriptTag, path, basePath;

        packageName = packageName.toLowerCase();
        found       = false;
        path        = profilePath + ds + 'backage-scripts' + ds + packageName + ds + version + '.js'

        if(fileIO.exists(path)){
          found = true;
        }
        else{
          if(downloader.fileDownloader(packageName, version)){
            found = true;
          }
          else{
            found = false;
          }
        }

        if(found){
          scriptTag = node.ownerDocument.createElement('script');
          //scriptTag.src = basePath;
          scriptTag.type = 'text/javascript';
          scriptTag.setAttribute('data-backage-replaced', true);
          scriptTag.setAttribute('data-backage-name', packageName);
          scriptTag.setAttribute('data-backage-version', version);

          var resourceData = fileIO.open(path);

          if (!resourceData.closed) {
              scriptTag.innerHTML = resourceData.read();
              resourceData.close();
          }

          node.parentNode.replaceChild(scriptTag, node);
        }

        return found;
      }
});

var factory = xpcom.Factory({
  contract: contractId,
  Component: Interceptor,
  unregister: false 
});

/// unload 
var unload = require('sdk/system/unload');

unload.when(function() {
  function trueUnregister() {
    categoryManager.deleteCategoryEntry("content-policy", contractId, false);
    
    try {
      console.log("xpcom.isRegistered(factory)="  + xpcom.isRegistered(factory));
      console.log("trueUnregister");
      xpcom.unregister(factory);
      console.log("xpcom.isRegistered(factory)="  + xpcom.isRegistered(factory));
    } catch (ex) {
        Cu.reportError(ex);
    }

  }
  if ("dispatch" in Cu) {
    console.log('"dispatch" in Cu');
    Cu.dispatch(trueUnregister, trueUnregister);
  } else {
    console.log('"dispatch" not! in Cu');
    Cu.import("resource://gre/modules/Services.jsm");
    Services.tm.mainThread.dispatch(trueUnregister, 0);
  }
});

var interceptor = Cc[contractId].createInstance(Ci.nsIContentPolicy);

categoryManager.deleteCategoryEntry("content-policy", contractId, false);
categoryManager.addCategoryEntry("content-policy", contractId, contractId, false, true);

/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2017, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

/*eslint valid-jsdoc: "off"*/
(function(Application, Window, Utils, API, VFS, GUI) {
  'use strict';

  /////////////////////////////////////////////////////////////////////////////
  // WINDOWS
  /////////////////////////////////////////////////////////////////////////////

  function ApplicationAppStreamWindow(app, metadata, scheme) {
    Window.apply(this, ['ApplicationAppStreamWindow', {
      icon: metadata.icon,
      title: metadata.name,
      allow_maximize: false,
      allow_move: false,
      allow_resize: false,
      width: 100,
      height: 350,
    }, app, scheme]);
  }

  ApplicationAppStreamWindow.prototype = Object.create(Window.prototype);
  ApplicationAppStreamWindow.constructor = Window.prototype;

  ApplicationAppStreamWindow.prototype.init = function(wmRef, app, scheme) {
    var root = Window.prototype.init.apply(this, arguments);
    var self = this;

    // Render our Scheme file fragment into this Window
    this._render('AppStreamWindow');

    // Put your GUI code here (or make a new prototype function and call it):
    $(".ApplicationAppStreamWindow").css('top','calc(100vh - 350px)');
    $(".ApplicationAppStreamWindow").css('width', '100vw');
    $(".ApplicationAppStreamWindow").css('left', '0px');

    sendMessageToApp("showStreams");

    this._on( 'destroy' , function() {
      console.log("now closing streams");
    	   sendMessageToApp("hideStreams");
    });
    this._on( 'minimize' , function() {
         sendMessageToApp("hideStreams");
	  });
    this._on( 'restore' , function() {
	       sendMessageToApp("showStreams");
	   });




    return root;
  };

  ApplicationAppStreamWindow.prototype.destroy = function() {
    // This is where you remove objects, dom elements etc attached to your
    // instance. You can remove this if not used.
    if ( Window.prototype.destroy.apply(this, arguments) ) {
      return true;
    }
    return false;
  };

  /////////////////////////////////////////////////////////////////////////////
  // APPLICATION
  /////////////////////////////////////////////////////////////////////////////

  function ApplicationAppStream(args, metadata) {
    Application.apply(this, ['ApplicationAppStream', args, metadata]);
  }

  ApplicationAppStream.prototype = Object.create(Application.prototype);
  ApplicationAppStream.constructor = Application;

  ApplicationAppStream.prototype.destroy = function() {
    // This is where you remove objects, dom elements etc attached to your
    // instance. You can remove this if not used.
    if ( Application.prototype.destroy.apply(this, arguments) ) {
      return true;
    }
    return false;
  };

  ApplicationAppStream.prototype.init = function(settings, metadata, scheme) {
    Application.prototype.init.apply(this, arguments);
    this._addWindow(new ApplicationAppStreamWindow(this, metadata, scheme));

    // Example on how to call `api.js` methods
    this._api('test', {}, function(err, res) {
      console.log('Result from your server API method', err, res);
    });
  };

  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Applications = OSjs.Applications || {};
  OSjs.Applications.ApplicationAppStream = OSjs.Applications.ApplicationAppStream || {};
  OSjs.Applications.ApplicationAppStream.Class = Object.seal(ApplicationAppStream);

})(OSjs.Core.Application, OSjs.Core.Window, OSjs.Utils, OSjs.API, OSjs.VFS, OSjs.GUI);

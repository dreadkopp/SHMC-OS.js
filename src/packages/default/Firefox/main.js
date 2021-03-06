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
(function(Application, GUI, Dialogs, Utils, API, VFS) {
  'use strict';

  /////////////////////////////////////////////////////////////////////////////
  // APPLICATION
  /////////////////////////////////////////////////////////////////////////////

  function ApplicationFirefox(args, metadata) {
    Application.apply(this, ['ApplicationFirefox', args, metadata, {
      src: 'http://linux-xpra:10002/index.html?server=linux-xpra&port=10002&encoding=auto&keyboard_layout=&submit=true&clipboard=true&username=streamer&password=streamer&audio_codec=mediasource%3Aopus%2Bmka&sound=true&insecure=true&normal_fullscreen=true',
      title: metadata.name,
      icon: metadata.icon,
      width: 640,
      height: 480,
      allow_resize: true,
      allow_restore: true,
      allow_maximize: true
    }]);
  }

  ApplicationFirefox.prototype = Object.create(Application.prototype);

  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Applications = OSjs.Applications || {};
  OSjs.Applications.ApplicationFirefox = OSjs.Applications.ApplicationFirefox || {};
  OSjs.Applications.ApplicationFirefox.Class = Object.seal(ApplicationFirefox);

})(OSjs.Helpers.IFrameApplication, OSjs.GUI, OSjs.Dialogs, OSjs.Utils, OSjs.API, OSjs.VFS);

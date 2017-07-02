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

//global variables we need to show/hide menu quickly
var wheel;
var menuMainEntries = [];
var subwheel = [];
//set size (4==quarter, 2==half, 1==full .... do not set this to 0... seriously XD .. also full circle is broken due to unselect not working anymore (no null navitems available))
var size = 2;
//set orientation 'top' or 'bottom'
var orientation = "bottom";
var fontsize_main = "18px"
var fontsize_sub = "12px"

function hideMenu() {
    if ( $('#wheelDiv').css("display") == "block" ) {
      //TODO: unselect current selected item
      //hide all subwheels
      for ( var x=0; x < subwheel.length; x++){
        for (var y=0; y<subwheel[x].navItems.length; y++) {
          subwheel[x].navItems[y].navItem.hide();
        }
      }
      jQuery('#wheelDiv').hide();
    }
}



(function(WindowManager, Window, GUI, Utils, API, VFS) {
  'use strict';

  function _createIcon(aiter, aname, arg) {
    return API.getIcon(aiter.icon, arg, aiter.className);
  }

  /**
   * Create default application menu with categories (sub-menus)
   */
  function doBuildCategoryMenu(ev) {
    var apps = OSjs.Core.getPackageManager().getPackages();
    var wm = OSjs.Core.getWindowManager();
    var cfgCategories = wm.getDefaultSetting('menu');

    function createEvent(iter) {
      return function(el) {
        OSjs.GUI.Helpers.createDraggable(el, {
          type: 'application',
          data: {
            launch: iter.name
          }
        });
      };
    }

    function clickEvent(iter) {
      return function() {
        API.launch(iter.name);
      };
    }

    var cats = {};

    Object.keys(cfgCategories).forEach(function(c) {
      cats[c] = [];
    });

    Object.keys(apps).forEach(function(a) {
      var iter = apps[a];
      if ( iter.type === 'application' && iter.visible !== false ) {
        var cat = iter.category && cats[iter.category] ? iter.category : 'unknown';
        cats[cat].push({name: a, data: iter});
      }
    });

    var list = [];

    Object.keys(cats).forEach(function(c) {
      var submenu = [];
      for ( var a = 0; a < cats[c].length; a++ ) {
        var iter = cats[c][a];

        submenu.push({
          title: iter.data.name,
          icon: _createIcon(iter.data, iter.name),
          tooltip: iter.data.description,
          onCreated: createEvent(iter),
          onClick: clickEvent(iter)
        });
      }

      if ( submenu.length ) {
        list.push({
          title: OSjs.Applications.CoreWM._(cfgCategories[c].title),
          icon: API.getIcon(cfgCategories[c].icon, '16x16'),
          menu: submenu
        });

      }
    });

    return list;
  }

  /////////////////////////////////////////////////////////////////////////////
  // NEW MENU
  /////////////////////////////////////////////////////////////////////////////

  function ApplicationMenu() {
    var root = this.$element = document.createElement('gui-menu');
    this.$element.id = 'CoreWMApplicationMenu';

    var apps = OSjs.Core.getPackageManager().getPackages();

    function createEntry(a, iter) {
      var entry = document.createElement('gui-menu-entry');

      var img = document.createElement('img');
      img.src = _createIcon(iter, a, '32x32');

      var txt = document.createElement('div');
      txt.appendChild(document.createTextNode(iter.name)); //.replace(/([^\s-]{8})([^\s-]{8})/, '$1-$2')));

      Utils.$bind(entry, 'click', function(ev) {
        ev.stopPropagation();
        API.launch(a);
        API.blurMenu();
      });

      entry.appendChild(img);
      entry.appendChild(txt);
      root.appendChild(entry);
    }



    Object.keys(apps).forEach(function(a) {
      var iter = apps[a];
      if ( iter.type === 'application' && iter.visible !== false ) {
        createEntry(a, iter);
      }
    });
  }

  ApplicationMenu.prototype.destroy = function() {

    if ( this.$element ) {
      this.$element.querySelectorAll('gui-menu-entry').forEach(function(el) {
        Utils.$unbind(el, 'click');
      });
      Utils.$remove(this.$element);
    }
    this.$element = null;
  };

  ApplicationMenu.prototype.show = function(pos) {
    if ( !this.$element ) {
      return;
    }

    if ( !this.$element.parentNode ) {
      document.body.appendChild(this.$element);
    }

    // FIXME: This is a very hackish way of doing it and does not work when button is moved!
    Utils.$removeClass(this.$element, 'AtBottom');
    Utils.$removeClass(this.$element, 'AtTop');
    if ( pos.y > (window.innerHeight / 2) ) {
      Utils.$addClass(this.$element, 'AtBottom');

      this.$element.style.top = 'auto';
      this.$element.style.bottom = '30px';
    } else {
      Utils.$addClass(this.$element, 'AtTop');

      this.$element.style.bottom = 'auto';
      this.$element.style.top = '30px';
    }

    this.$element.style.left = pos.x + 'px';
  };

  ApplicationMenu.prototype.getRoot = function() {
    return this.$element;
  };

  /////////////////////////////////////////////////////////////////////////////
  // MENU
  /////////////////////////////////////////////////////////////////////////////

  function doShowMenu(ev) {
    var wm = OSjs.Core.getWindowManager();

    var menu_switch = wm.getSetting('useTouchMenu');

    if(menu_switch){
      if ( (wm && wm.getSetting('useTouchMenu') === true) ) {
        var inst = new ApplicationMenu();
        var pos = {x: ev.clientX, y: ev.clientY};

        if ( ev.target ) {
          var rect = Utils.$position(ev.target, document.body);
          if ( rect.left && rect.top && rect.width && rect.height ) {
            pos.x = rect.left - (rect.width / 2);

            if ( pos.x <= 16 ) {
              pos.x = 0; // Snap to left
            }

            var panel = Utils.$parent(ev.target, function(node) {
              return node.tagName.toLowerCase() === 'corewm-panel';
            });

            if ( panel ) {
              var prect = Utils.$position(panel);
              pos.y = prect.top + prect.height;
            } else {
              pos.y = rect.top + rect.height;
            }
          }
        }
        API.createMenu(null, pos, inst);
      } else {
        var list = doBuildCategoryMenu(ev);
        var m = API.createMenu(list, ev);
        if ( m && m.$element ) {
          Utils.$addClass(m.$element, 'CoreWMDefaultApplicationMenu');
        }
      }
    }


    else {


        if ($('#wheelDiv').length != 0 ){
          $('#wheelDiv').show();
          var subwheelToFixIndex = wheel.selectedNavItemIndex;
          //check case no submenu was selected
          if (subwheelToFixIndex < menuMainEntries.length) {
            var cursub = subwheel[subwheelToFixIndex];
            var firstNullSubItem = (cursub.navItemCount / size);
            //navigate to first 'null' element of last selected subwheel
            subwheel[subwheelToFixIndex].navigateWheel(firstNullSubItem);
          }

          //navigate to first 'null' element of main wheel
          wheel.navigateWheel(menuMainEntries.length);
        }
        else {
          $('<div id="wheelDiv"></div>').insertAfter('corewm-panel');
          CreateCircularMenu();
          //set css according to orientation and size
          if (orientation == "top") {
            $("#wheelDiv svg").css("top", "-250px");
            $("#wheelDiv svg").css("left", "-250px");
          }
          if (orientation == "bottom") {
            $("#wheelDiv svg").css("top", "calc(100vh - 250px)");
            $("#wheelDiv svg").css("left", "calc(50vw - 250px)");
          }
        }


      function CreateCircularMenu(){

        //var wheel;
        var dimensions = [500,500];
        var apps = OSjs.Core.getPackageManager().getPackages();
        var wm = OSjs.Core.getWindowManager();
        var cfgCategories = wm.getDefaultSetting('menu');
        //var menuMainEntries = [];
        //TODO: push only those categories which have children ...
        Object.keys(cfgCategories).forEach(function(c) {
          if (checkForChildren(c,apps)){
          menuMainEntries.push(c);
          }
        });

        function addMenuControls() {
          for (var i=0; i< menuMainEntries.length; i++ ) {
            wheel.navItems[i].navigateFunction = function () {
              //hide all other submenus
              for ( var x=0; x < subwheel.length; x++){
                for (var y=0; y<subwheel[x].navItems.length; y++) {
                  subwheel[x].navItems[y].navItem.hide();
                }
              }
              //then show submenu for specific mainentry
              var index = this.itemIndex;
              for (var x = 0; x < (subwheel[index].navItemCount / size) ; x++) {
                subwheel[index].navItems[x].navItem.show();
                subwheel[index].navItems[x].navigateFunction =  function () {
                  //launch OSJS App
                  OSjs.API.launch("Application"+this.title.replace( /\s/g, ""));
                  //hide Menu after successful launch
                  hideMenu();
                }
              }
            }
          };
        }

        //return true if there are apps with category == passed category
        function checkForChildren (category, apps) {

          var hasChildren = false;
          Object.keys(apps).forEach(function(key) {
              if (apps[key].category == category){
                hasChildren = true;
              }
          });
          if (category == 'unknown') {
            hasChildren = true;
          }
          return hasChildren;
        }


        /*
        control with keyboard or gamecontroller

        function navTo (index) {
          wheel.navigateWheel(index);
          wheel.navItems[wheel.selectedNavItemIndex].navigateFunction()
        }


        */

        function buildWheel () {


                wheel = new wheelnav('wheelDiv', null , dimensions[0] , dimensions[1]);

                wheel.colors = ['#868383'];
                wheel.spreaderEnable = false;
                wheel.spreaderRadius = 65;
                wheel.slicePathFunction = slicePath().DonutSlice;
                wheel.sliceTransform = sliceTransform().NullTransform;
                wheel.clickModeRotate = false;
                wheel.slicePathCustom = slicePath().DonutSliceCustomization();
                wheel.slicePathCustom.minRadiusPercent = 0.15;
                wheel.slicePathCustom.maxRadiusPercent = 0.55;
                wheel.sliceSelectedPathCustom = wheel.slicePathCustom;
                wheel.sliceInitPathCustom = wheel.slicePathCustom;
                var menuEntries = createMainEntries(menuMainEntries);
                if (orientation == "top") {wheel.navAngle = ((180/size)/menuMainEntries.length);}
                if (orientation == "bottom") {wheel.navAngle = ((180/size)/menuMainEntries.length)+180;}
                wheel.animateeffect="linear";
                wheel.animatetime = 200;
                wheel.titleRotateAngle = 180;
                wheel.titleFont = '100 ' + fontsize_main + ' trench, sans-serif'
                //wheel.titleWidth= 2;

                function createMainEntries(entries){
                  var menuEntries = [];
                  //fill menu with entries
                  for (var i=0; i < entries.length; i++) {
                      menuEntries.push(entries[i]);
                  }
                  //fill 3/4 with empty entries
                  for (var i=0; i < (entries.length*(size-1)); i++) {
                    menuEntries.push(null);
                  }
                    return menuEntries;

                }



                wheel.createWheel(menuEntries);
                wheel.navigateWheel(menuMainEntries.length);

                //function needed to get rid of GUI-less applications (like CoreWM)
                String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

                function createSubmenus() {

                    for (var j = 0; j < menuMainEntries.length ; j++) {
                      var name = menuMainEntries[j] + '_sub';
                      console.log('starting submenu' + name);

                      var subMenuEntries = [];

                      //add apps according to their category to submenu
                      Object.keys(apps).forEach(function(key) {
                          if (apps[key].category == menuMainEntries[j]){
                            subMenuEntries.push(apps[key].name);
                          }
                      });
                      //handle undefined category
                      if (menuMainEntries[j] == 'unknown') {
                        Object.keys(apps).forEach(function(key) {
                            if (apps[key].category == null){
                              //check for nonApplication-packages like i.e. CoreWM
                              if (apps[key].className.contains('Application')){
                              subMenuEntries.push(apps[key].name);
                              }
                            }
                        });
                      }


                      subwheel[j] = new wheelnav(name, wheel.raphael);
                      subwheel[j].colors = ['#b1afaf'];
                      subwheel[j].slicePathFunction = slicePath().DonutSlice;
                      subwheel[j].clickModeRotate = false;
                      subwheel[j].slicePathCustom = slicePath().DonutSliceCustomization();
                      subwheel[j].slicePathCustom.minRadiusPercent = 0.57;
                      subwheel[j].slicePathCustom.maxRadiusPercent = 1;
                      subwheel[j].sliceSelectedPathCustom = subwheel[j].slicePathCustom;
                      subwheel[j].sliceInitPathCustom = subwheel[j].slicePathCustom;
                      if (orientation == "top") {subwheel[j].navAngle = ((180/size)/subMenuEntries.length);}
                      if (orientation == "bottom") {subwheel[j].navAngle = ((180/size)/subMenuEntries.length)+180;}
                      subwheel[j].animateeffect = 'linear';
                      subwheel[j].animatetime = 200;
                      subwheel[j].titleRotateAngle = 180;
                      subwheel[j].titleFont = '100 ' + fontsize_sub + ' trench, sans-serif'
                      subwheel[j].createWheel(createMainEntries(subMenuEntries));
                      subwheel[j].navigateWheel(subMenuEntries.length);
                      for (var k = 0; k < subwheel[j].navItems.length; k++) {
                        subwheel[j].navItems[k].navItem.hide();
                      }
                      console.log('created submenu' + name + ' j= ' + j);

                    }
                }

                createSubmenus();

                addMenuControls();
        }

          buildWheel();

      }




    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Applications                          = OSjs.Applications || {};
  OSjs.Applications.CoreWM                   = OSjs.Applications.CoreWM || {};
  OSjs.Applications.CoreWM.showMenu          = doShowMenu;

})(OSjs.Core.WindowManager, OSjs.Core.Window, OSjs.GUI, OSjs.Utils, OSjs.API, OSjs.VFS);

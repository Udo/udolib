var Stage = {
  
  implementation : {
    
    layers : {
      
    	create : function(name) {
      	var layer = new PIXI.Container();
      	while(!name || this.layers[name])
      	  name = 'L'+(this._idCtr++);
        layer.name = name;
        this.layers[name] = layer;
        this.root.addChild(layer);
        return(layer);
    	},
    	
    	remove : function(name) {
      	var l = this.layers[name];
      	if(l) {
        	this.root.removeChild(l);
        	return(true);
      	}
      	return(false);
    	},	
      
    },

    bind : function(self, source, destination) {
      if(!destination)
        destination = {};
      for(var prop in source) if(source.hasOwnProperty(prop)) {
        destination[prop] = source[prop].bind(self); 
      }
      return(destination);
    },

  	functions : {

      clamp : function(v, min, max) {
        if(v < min)
          v = min;
        if(v > max)
          v = max;
        return(v);
      },
    
      makeDraggable : function(o, dragProp) {
        var stage = this;
        if(!dragProp)
          dragProp = 'position';
        var x0 = 0;
        var y0 = 0;
        o.dragStart = function(propOverride) {
          if(propOverride)
            dragProp = propOverride;
          x0 = o[dragProp].x;
          y0 = o[dragProp].y;
        }
        o.dragUpdate = function(xd, yd) {
          o[dragProp].x = -xd + x0;
          o[dragProp].y = -yd + y0;
          if(stage.options.panArea) {
            o[dragProp].x = stage.clamp(o[dragProp].x, stage.options.panArea.left, stage.options.panArea.right);
            o[dragProp].y = stage.clamp(o[dragProp].y, stage.options.panArea.top, stage.options.panArea.bottom);
          }
          stage.trigger('pan', o[dragProp]);
        }
        o.stage = function(x, y) {
          o[dragProp].x = x;
          o[dragProp].y = y;
          if(stage.options.panArea) {
            o[dragProp].x = stage.clamp(o[dragProp].x, stage.options.panArea.left, stage.options.panArea.right);
            o[dragProp].y = stage.clamp(o[dragProp].y, stage.options.panArea.top, stage.options.panArea.bottom);
          }
          stage.trigger('pan', o[dragProp]);
        }
      },
    	
    	getViewportSize : function() {
    		return({
    			x : $(document).width(), 
    			y : $(document).height(), 
    			});
    	},
    	
    	trigger : function(eventName, param1, param2, param3) {
      	if(this.options.stopped || this.options.stopEvents)
      	  return;
      	if(this.eventHandlers[eventName])
      	  return(this.eventHandlers[eventName](param1, param2, param3));
    	},
    	
    	on : function(eventName, handlerFunc) {
    	  this.eventHandlers[eventName] = handlerFunc;
    	},
    	
    	zoom : function(zoomLevel) {
        this.mouse.zoom = this.clamp(zoomLevel, this.options.minZoom, this.options.maxZoom);
        this.trigger('zoom', this.mouse);
    	},
    
    	panBy : function(xd, yd) {
        this.root.dragUpdate(xd, yd);
    	},
    	
    	panTo : function(x, y) {
        this.root.dragSetPosition(x, y);
    	},
    	
    	animate : function(f) {
      	this.animation.add(f);
    	},
    
      once : function(f) {
        this.animation.nextFrameCommandList.push(f);        
      },
    
      initRenderer : function() {
      	this.renderer = PIXI.autoDetectRenderer(
      		this.size.x, 
      		this.size.y, {
      			transparent : true,
      			autoResize : true,
      			antialias : true,
      		});
      	document.body.appendChild(this.renderer.view);
        this.root = new PIXI.Container();
        this.root.interactive = true;  
        $('canvas').on('contextmenu', this.hooks.sink); // disable right click
      	$(window).on('resize', this.hooks.resize);
        $(this.renderer.view).on('mousedown', this.hooks.mousedown);
        $(this.renderer.view).on('mouseup', this.hooks.mouseup);
        $(this.renderer.view).on('mouseout', this.hooks.mouseout);
        $(this.renderer.view).on('mouseenter', this.hooks.mouseenter);
        this.root.mousemove = this.hooks.mousemove;    
        this.renderer.view.addEventListener("mousewheel", this.hooks.wheel, false);
        this.renderer.view.addEventListener("DOMMouseScroll", this.hooks.wheel, false);    
        this.root.click = this.hooks.click;
        this.hooks.resize();
        this.debug.animationTimestamp = new Date().getTime();
        this.debug.renderTimestamp = new Date().getTime();
      },
    
      renderFrame : function() {
        if(this.debug.frameSkipStatus > 0) {
          this.debug.frameSkipStatus -= 1;
        }
      	else if(!this.options.stopAnimation) {
      		const st = new Date().getTime();
      		if(this.root.scale.x != this.mouse.zoom) {
        	  if(this.options.smoothZoom) {
              this.root.scale.x = (this.options.smoothZoom*this.root.scale.x) + (1-this.options.smoothZoom)*this.mouse.zoom;
              this.root.scale.y = (this.options.smoothZoom*this.root.scale.y) + (1-this.options.smoothZoom)*this.mouse.zoom;
        	  }	else {
              this.root.scale.x = this.mouse.zoom;
              this.root.scale.y = this.mouse.zoom;
        	  }
      		}		
      		this.animation.doAll((st - this.debug.animationTimestamp) / 1000);
          this.renderer.render(this.root);      
      		const ct = new Date().getTime();
      		this.debug.frameInterval = 
      		  ((this.debug.frameInterval || 10)*0.97) + 
      		  ((st-this.debug.renderTimestamp)*0.03);
      		this.debug.fps = Math.round(1000/this.debug.frameInterval);      		
      		this.debug.threadLoad = (this.debug.threadLoad || 0)*0.97 + (ct-st)*0.03;
      		var loadpct = Math.round(100*this.debug.threadLoad/this.debug.frameInterval);
      		if(loadpct < 10) loadpct = '0'+loadpct;
      		if(loadpct > this.options.frameSkipThreshold) {
            this.debug.frameSkipStatus += 1;
            this.debug.frameSkipCounter += 1;
      		}
      		this.debug.threadLoadPercent = loadpct;
      		this.debug.renderTimestamp = st;
      		this.debug.animationTimestamp = st;
      		this.trigger('frameinfo', this.debug);
      	}
      	if(!this.options.stopped)
          requestAnimationFrame(this.renderFrame);
    	},
    	
    	start : function() {
      	this.options.stopAnimation = false;
      	this.options.stopped = false;
      	this.options.stopEvents = false;
      	this.renderFrame();
    	},
  
      stop : function() {
      	this.options.stopped = true;
      },

  	},
	
	  animation : {
      
      updateCachedBitmap : function(o) {
        o.cacheAsBitmap = false;
        this.animation.nextFrameCommandList.push(function() {
          o.cacheAsBitmap = true;
        });
      },
  
      add : function(f) { 
        this.animation.list.push(f); 
        this.trigger('animationstart', f, this.animation.list.length-1);
      },
  
      remove : function(f) {
        var idx = this.animation.list.indexOf(f);
        if(idx > -1) {
          this.trigger('animationend', f, idx);
          this.animation.list.splice(idx, 1);
        }
      },
      
      doAll : function(deltaTime) {
        if(this.animation.commandList.length > 0) {
          each(this.animation.commandList, function(f) {
            f(deltaTime);
          });
          this.animation.commandList = this.animation.nextFrameCommandList;
          this.animation.nextFrameCommandList = [];
        }
        each(this.animation.list, function(f) {
          try {
            if(typeof f !== 'function' || f(deltaTime) === false) {
              this.animation.remove(f);
            }
          } catch(ee) {
            console.error('error during animation', ee);
            this.animation.remove(f);
          }
        });
      },
      
    },
  	
  	hooks : { // for incoming events
    	
    	click : function(e) {
        this.trigger('click', this.mouse);
      },
    	
      mousedown : function(e) {
        this.mouse.anyButton = true;
        var buttonContext = 'any';
        if(e.which == 1 || e.button == 0) {
          this.mouse.leftButton = true;
          buttonContext = 'left';
        } else if(e.which == 2 || e.button == 1) {
          this.mouse.middleButton = true;
          buttonContext = 'middle';
        } else if(e.which == 3 || e.button == 2) {
          this.mouse.rightButton = true;
          buttonContext = 'right';
        } else {
          this.mouse.otherButton = e.which+':'+e.button;
        }
        this.mouse.x0 = this.mouse.x;
        this.mouse.y0 = this.mouse.y;
        this.trigger('mousedown', this.mouse, buttonContext);        
        this.trigger('mousedown_'+buttonContext, this.mouse);        
      },
      
      mousemove : function(e) {
        this.mouse.x = (e.data.global.x - this.root.position.x) / this.root.scale.x;
        this.mouse.y = (e.data.global.y - this.root.position.y) / this.root.scale.y;
        if(this.mouse.anyButton) {
          this.mouse.xd = this.mouse.x - this.mouse.x0;
          this.mouse.yd = this.mouse.y - this.mouse.y0;
        }
        this.trigger('mousemove', this.mouse);
      },
      
      mouseup : function(e) {
        this.mouse.anyButton = false;
        var buttonContext = 'any';
        if(e.which == 1 || e.button == 0) {
          this.mouse.leftButton = false;
          buttonContext = 'left';
        } else if(e.which == 2 || e.button == 1) {
          this.mouse.middleButton = false;
          buttonContext = 'middle';
        } else if(e.which == 3 || e.button == 2) {
          this.mouse.rightButton = false;
          buttonContext = 'right';
        } else {
          this.mouse.otherButton = e.which+':'+e.button;
        }
        this.trigger('mouseup', this.mouse, buttonContext);   
        this.trigger('mouseup_'+buttonContext, this.mouse);     
      },
      
      mouseout : function(e) {
        // cancel any dragging operations
        var stage = this;
        var buttonProps = ['left', 'middle', 'right', 'any'];
        buttonProps.forEach(function(buttonContext) {
          if(stage.mouse[buttonContext+'Button']) {
            stage.mouse[buttonContext+'Button'] = false;
            stage.trigger('mouseup', stage.mouse, buttonContext);   
            stage.trigger('mouseup_'+buttonContext, stage.mouse);     
          }
        });
        this.trigger('mouseout', this.mouse);        
      },

      mouseenter : function(e) {
        this.trigger('mouseenter', this.mouse);        
      },
      
    	resize : function(){    
    	  this.size = this.getViewportSize();
    	  this.renderer.resize(this.size.x, this.size.y);  		
        this.root.position.x = this.size.x/2;
        this.root.position.y = this.size.y/2;
        this.trigger('resize', this.size);
      },
      
    	sink : function(e) { 
        e.preventDefault();
        return(false);
      },
    	
      wheel : function(e) {
        if(!this.options.disableWheelZoom) {
          if(e.wheelDeltaY < 0) {
            this.zoom(this.mouse.zoom - this.options.zoomStep);
          } else if(e.wheelDeltaY > 0) {
            this.zoom(this.mouse.zoom + this.options.zoomStep);
          }
        }
        this.trigger('wheel', e.wheelDeltaY, e.wheelDeltaX);
      },
    	
  	},
    
  },
  
  create : function(opt) {
    
    var s;
    s = {
        
      _idCtr : 1000,
      size : false, 
      renderer : false,
      root : false,
      debug : {
        fps : 60,
        threadLoad : 0,
        threadLoadPercent : 0,
        frameInterval : 33,
        frameSkipStatus : 0,
        frameSkipCounter : 0,
        animationTimestamp : 0,
        renderTimestamp : 0,
      },
    	mouse : {
      	leftButton : false,
      	middleButton : false,
      	rightButton : false,
      	anyButton : false,
      	zoom : 1.0,
      	x : 0, y : 0,
      	x0 : 0,	y0 : 0,
      	xd : 0,	yd : 0,
    	},    	     
      eventHandlers : { 
        click : false,
        mousedown : false,
        mousemove : false,
        mouseup : false,
        resize : false,
        zoom : false,
      },
    	    	
    }
    
  	s.options = opt;
  	opt.frameSkipThreshold = opt.frameSkipThreshold || 50;
  	opt.minZoom = opt.minZoom || 0.5;
  	opt.maxZoom = opt.maxZoom || 3.0;
  	opt.zoomStep = opt.zoomStep || 0.2;
  	opt.stopped = true;
  	opt.stopEvents = true;
 
    Stage.implementation.bind(s, Stage.implementation.functions, s);
    s.layers = Stage.implementation.bind(s, Stage.implementation.layers);    
    s.hooks = Stage.implementation.bind(s, Stage.implementation.hooks);
    s.animation = Stage.implementation.bind(s, Stage.implementation.animation, {
      paused : false,
      stopped : false,
      list : [],
      commandList : [],
      nextFrameCommandList : [],
    });
 
    s.size = s.getViewportSize();
    s.initRenderer();
    
    if(s.options.smoothScroll) {
      s.makeDraggable(s.root, 'pivotTarget');
      s.root.pivotTarget = { x : 0, y : 0 };
      s.animation.add(function(dt) {
        s.root.pivot.x = (s.options.smoothScroll)*s.root.pivot.x + (1-s.options.smoothScroll)*s.root.pivotTarget.x;
        s.root.pivot.y = (s.options.smoothScroll)*s.root.pivot.y + (1-s.options.smoothScroll)*s.root.pivotTarget.y;
      });
    } else {
      s.makeDraggable(s.root, 'pivot');
    }
  
    return(s);
  	
  },
  	
}



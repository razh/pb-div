/*
  This is a simple demonstration of a possible avenue for a speed increase.
  Whereas the plain CSS version is capabale of several hundred divs,
  this version is capable of several thousand (of course, for the best
  performance, we could use WebGL, but iOS doesn't support that right now.)

  For obvious reasons, we cannot use this with web content.

  The code base between the CSS/canvas versions are similar enough that should
  be able to merge them without much difficulty.
*/

(function( window, document, undefined ) {
  'use strict';

  // Constants.
  var RECT_SIZE = 50;

  // Global animation state.
  var anim;

  // Same utilities. Sorry about the DRY.
  function randomInt( min, max ) {
    return Math.round( min + Math.random() * ( max - min ) );
  }

  function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
  }


  // Prevent scrolling on iOS devices.
  window.addEventListener( 'touchmove', function( event ) {
    event.preventDefault();
  });

  function Animation() {
    this.prevTime = Date.now();
    this.currTime = this.prevTime;
    this.running = true;

    this.canvas = document.createElement( 'canvas' );
    this.ctx = this.canvas.getContext( '2d' );

    this.elements = [];

    this.clickHandler = function( event ) {
      var x = event.pageX - this.canvas.offsetLeft;
      var y = event.pageY - this.canvas.offsetTop;

      var el;
      var i, il;
      for ( i = 0, il = this.elements.length; i < il; i++ ) {
        if ( this.elements[i].contains( x, y ) ) {
          el = this.elements[i];
          break;
        }
      }

      if ( el ) {
        this.elements.push( new Rect( el.x, el.y, RECT_SIZE, RECT_SIZE ) );
      }
    }.bind( this );

    if ( window.ontouchstart !== undefined ) {
      this.canvas.addEventListener( 'touchstart', this.clickHandler );
    } else {
      this.canvas.addEventListener( 'mousedown', this.clickHandler );
    }
  }

  Animation.prototype.update = function() {
    this.currTime = Date.now();
    var dt = this.currTime - this.prevTime;
    this.prevTime = this.currTime;

    // Milliseconds to seconds.
    dt *= 1e-3;

    var width = this.canvas.width;
    var height = this.canvas.height;
    this.elements.forEach(function( element ) {
      element.update( dt, width, height );
    });
  };

  Animation.prototype.draw = function() {
    var ctx = this.ctx;

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
    ctx.beginPath();

    this.elements.forEach(function( element ) {
      element.draw( ctx );
    });

    ctx.fillStyle = '#fff';
    ctx.fill();
  };

  anim = new Animation();


  function Rect( x, y, width, height ) {
    this.x = x || 0;
    this.y = y || 0;

    this.width = width || 0;
    this.height = height || 0;

    this.vx = randomSign() * randomInt( 20, 100 );
    this.vy = randomSign() * randomInt( 20, 100 );
  }

  Rect.prototype.contains = function( x, y ) {
    return this.x <= x && x <= this.x + this.width &&
           this.y <= y && y <= this.y + this.height;
  };

  Rect.prototype.update = function( dt, width, height ) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if ( this.x < 0 ) {
      this.x = 0;
      this.vx = -this.vx;
    }

    if ( this.x + this.width > width ) {
      this.x = width - this.width;
      this.vx = -this.vx;
    }

    if ( this.y < 0 ) {
      this.y = 0;
      this.vy = -this.vy;
    }

    if ( this.y + this.height > height ) {
      this.y = height - this.height;
      this.vy = -this.vy;
    }
  };

  Rect.prototype.draw = function( ctx ) {
    ctx.rect( this.x, this.y, this.width, this.height );
  };


  function tick() {
    if ( !anim.running ) {
      return;
    }

    anim.update();
    anim.draw();
    window.requestAnimationFrame( tick );
  }

  (function init() {
    document.body.appendChild( anim.canvas );
    anim.canvas.width = window.innerWidth;
    anim.canvas.height = window.innerHeight;

    var width = anim.canvas.width;
    var height = anim.canvas.height;

    var rectCount = 1;
    var x, y;
    while ( rectCount-- ) {
      x = randomInt( 0, width );
      y = randomInt( 0, height );

      anim.elements.push( new Rect( x, y, RECT_SIZE, RECT_SIZE ) );
    }

    tick();
  }) ();
}) ( window, document );

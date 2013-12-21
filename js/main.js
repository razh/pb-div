(function( window, document, undefined ) {
  'use strict';

  // Global animation state.
  var anim;

  // Utility functions.
  // In the range [min, max).
  function randomInt( min, max ) {
    return min + Math.random() * ( max - min );
  }

  function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
  }


  /**
   * Normally, I wouldn't use a monolithic file structure, but for the sake
   * of speed, here we go.
   *
   * I'm also not including a requestAnimationFrame polyfill, but it would be
   * trivial to add one.
   *
   * This code targets the latest version of Chrome Canary/Chrome Stable.
   */
  function Animation() {
    // We don't need the accuracy of performance.now().
    this.prevTime = Date.now();
    this.currTime = this.prevTime;

    this.running = true;

    this.elements = [];
  }

  anim = new Animation();


  function Element( options ) {
    options = options || {};

    var el = options.el || '';
    var x = options.x || 0;
    var y = options.y || 0;

    if ( el && typeof el === 'string' ) {
      el = document.querySelector( el );
    }

    if ( el instanceof HTMLElement ) {
      this.el = el;
    } else {
      this.el = document.createElement( 'div' );
    }

    this.x = x;
    this.y = y;

    this.vx = randomSign() * randomInt( 200, 300 );
    this.vy = randomSign() * randomInt( 200, 300 );

    this.el.addEventListener( 'mousedown', function() {
      var element = new Element({
        x: this.x,
        y: this.y
      });
      anim.elements.push( element );
      document.body.appendChild( element.el );
    }.bind( this ));
  }

  Element.random = function() {
    return new Element({
      x: randomInt( 0, window.innerWidth ),
      y: randomInt( 0, window.innerHeight )
    });
  };

  Element.prototype.update = function( dt ) {
    if ( !dt ) {
      return;
    }

    var x = this.x;
    var y = this.y;
    var width = this.width;
    var height = this.height;

    x += this.vx * dt;
    y += this.vy * dt;

    // Keep everything in bounds with simple Pong physics.
    if ( x < 0 ) {
      x = 0;
      this.vx = -this.vx;
    }

    if ( x + width > window.innerWidth ) {
      x = window.innerWidth - width;
      this.vx = -this.vx;
    }

    if ( y < 0 ) {
      y = 0;
      this.vy = -this.vy;
    }

    if ( y + height > window.innerHeight ) {
      y = window.innerHeight - height;
      this.vy = -this.vy;
    }

    this.x = x;
    this.y = y;
  };

  // Switch to CSS translate at some point.
  Object.defineProperty( Element.prototype, 'x', {
    get: function() {
      return this.el.offsetLeft;
    },

    set: function( x ) {
      this.el.style.left = ( x || 0 ) + 'px';
    }
  });

  Object.defineProperty( Element.prototype, 'y', {
    get: function() {
      return this.el.offsetTop;
    },

    set: function( y ) {
      this.el.style.top = ( y || 0 ) + 'px';
    }
  });

  Object.defineProperty( Element.prototype, 'width', {
    get: function() {
      return this.el.offsetWidth;
    }
  });

  Object.defineProperty( Element.prototype, 'height', {
    get: function() {
      return this.el.offsetHeight;
    }
  });

  function update() {
    if ( !anim.running ) {
      return;
    }

    // Determine elapsed time.
    anim.currTime = Date.now();
    var dt = anim.currTime - anim.prevTime;
    anim.prevTime = anim.currTime;

    // Milliseconds to seconds.
    dt *= 1e-3;

    anim.elements.forEach(function( element ) {
      element.update( dt );
    });

    window.requestAnimationFrame( update );
  }


  (function init() {
    var elementCount = 1;
    var element;
    while ( elementCount-- ) {
      element = Element.random();
      anim.elements.push( element );
      document.body.appendChild( element.el );
    }

    update();
  }) ();

}) ( window, document );

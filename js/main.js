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

    document.body.appendChild( this.el );

    this.x = x;
    this.y = y;

    var computedStyle = window.getComputedStyle( this.el );
    // Assume that width/height don't change.
    this.width = parseFloat( computedStyle.width );
    this.height = parseFloat( computedStyle.height );


    this.vx = randomSign() * randomInt( 20, 50 );
    this.vy = randomSign() * randomInt( 20, 50 );

    this.el.addEventListener( 'mousedown', function() {
      var element = new Element({
        x: this.x,
        y: this.y
      });

      anim.elements.push( element );
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

    var width = this.width;
    var height = this.height;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Keep everything in bounds with simple Pong physics.
    if ( this.x < 0 ) {
      this.x = 0;
      this.vx = -this.vx;
    }

    if ( this.x + width > window.innerWidth ) {
      this.x = window.innerWidth - width;
      this.vx = -this.vx;
    }

    if ( this.y < 0 ) {
      this.y = 0;
      this.vy = -this.vy;
    }

    if ( this.y + height > window.innerHeight ) {
      this.y = window.innerHeight - height;
      this.vy = -this.vy;
    }

    var transform = 'translate3d(' +
      this.x + 'px, ' +
      this.y + 'px, ' +
      '0)';

    this.el.style.webkitTransform = transform;
    this.el.style.transform = transform;
  };

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
    }

    update();
  }) ();

}) ( window, document );

/**
 * Optimizations:
 *
 * - Use only CSS translates with translateZ(0) to avoid repainting.
 * - Cache window/element dimensions to save on lookup time (profile revealed
 *   significant performance increase in Element's update() method).
 *
 * Optimizations that did not work:
 *
 * - Only updating transform if the element had moved at least some minimum distance.
 */

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

    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  anim = new Animation();

  window.addEventListener( 'resize', function() {
    anim.width = window.innerWidth;
    anim.height = window.innerHeight;
  });


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

    // Only so we can determine the element dimensions.
    // This heavily impacts performance if we are appending >500 elements.
    // Element in document fragments get styles computed.
    document.body.appendChild( this.el );

    this.x = x;
    this.y = y;

    // Prevent initial rendering at (0, 0) on iOS devices.
    this.setTransform();

    var computedStyle = window.getComputedStyle( this.el );
    // Assume that width/height don't change.
    this.width = parseFloat( computedStyle.width );
    this.height = parseFloat( computedStyle.height );


    this.vx = randomSign() * randomInt( 20, 100 );
    this.vy = randomSign() * randomInt( 20, 100 );

    this.clickHandler = function() {
      var element = new Element({
        x: this.x,
        y: this.y
      });

      anim.elements.push( element );
    }.bind( this );

    if ( window.ontouchstart !== undefined ) {
      this.el.addEventListener( 'touchstart',  this.clickHandler );
    } else {
      this.el.addEventListener( 'mousedown',  this.clickHandler );
    }
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
    var windowWidth = anim.width;
    var windowHeight = anim.height;

    x += this.vx * dt;
    y += this.vy * dt;

    // Keep everything in bounds with simple Pong physics.
    if ( x < 0 ) {
      x = 0;
      this.vx = -this.vx;
    }

    if ( x + width > windowWidth ) {
      x = windowWidth - width;
      this.vx = -this.vx;
    }

    if ( y < 0 ) {
      y = 0;
      this.vy = -this.vy;
    }

    if ( y + height > windowHeight ) {
      y = windowHeight - height;
      this.vy = -this.vy;
    }

    this.x = x;
    this.y = y;

    this.setTransform();
  };

  Element.prototype.setTransform = function() {
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

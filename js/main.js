/**
 * Normally, I wouldn't use a monolithic file structure, but for the sake
 * of speed, here we go.
 *
 * I'm also not including a requestAnimationFrame polyfill, but it would be
 * trivial to add one.
 *
 * This code targets the latest version of Chrome Canary/Chrome Stable.

 * Optimizations:
 *
 * - Use only CSS translates with translateZ(0) to avoid repainting.
 * - Cache window/element dimensions to save on lookup time (profile revealed
 *   significant performance increase in Element's update() method, should
 *   probably double-check this).
 *
 * Optimizations that did not work:
 *
 * - Only updating transform if the element had moved at least some minimum distance.
 */

/*global Shared*/
/*exported AnimationCSS*/
var AnimationCSS = (function( window, document, undefined ) {
  'use strict';

  // Global animation state.
  var anim;

  var randomInt = Shared.randomInt;
  var randomSign = Shared.randomSign;

  function Animation() {
    // We don't need the accuracy of performance.now().
    this.prevTime = Date.now();
    this.currTime = this.prevTime;
    this.running = true;

    this.elements = [];

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    window.addEventListener( 'resize', function() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }.bind( this ));
  }

  Animation.prototype.update = function() {
    if ( !this.running ) {
      return;
    }

    // Determine elapsed time.
    this.currTime = Date.now();
    var dt = this.currTime - this.prevTime;
    this.prevTime = this.currTime;

    // Limit maximum frame time.
    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    // Milliseconds to seconds.
    dt *= 1e-3;

    this.elements.forEach(function( element ) {
      element.update( dt );
    });
  };


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
    // Elements in document fragments do not have styles computed.
    document.body.appendChild( this.el );

    this.x = x;
    this.y = y;
    this.parent = options.parent;

    // Prevent initial rendering at (0, 0) on iOS devices.
    this.setTransform();

    var computedStyle = window.getComputedStyle( this.el );
    // Assume that width/height don't change.
    this.width = parseFloat( computedStyle.width );
    this.height = parseFloat( computedStyle.height );


    this.vx = randomSign() * randomInt( 20, 100 );
    this.vy = randomSign() * randomInt( 20, 100 );

    this.clickHandler = function() {
      if ( !this.parent ) {
        return;
      }

      var element = new Element({
        x: this.x,
        y: this.y,
        parent: this.parent
      });

      this.parent.elements.push( element );
    }.bind( this );

    var clickEvent = window.ontouchstart !== undefined ? 'touchstart' : 'mousedown';
    this.el.addEventListener( clickEvent, this.clickHandler );
  }

  Element.prototype.update = function( dt ) {
    if ( !dt ) {
      return;
    }

    var x = this.x;
    var y = this.y;
    var halfWidth = 0.5 * this.width;
    var halfHeight = 0.5 * this.height;
    var windowWidth = anim.width;
    var windowHeight = anim.height;

    x += this.vx * dt;
    y += this.vy * dt;

    // Keep everything in bounds with simple Pong physics.
    // Assume that the div is centered on its origin.
    if ( x < halfWidth ) {
      x = halfWidth;
      this.vx = -this.vx;
    }

    if ( x + halfWidth > windowWidth ) {
      x = windowWidth - halfWidth;
      this.vx = -this.vx;
    }

    if ( y < halfHeight ) {
      y = halfHeight;
      this.vy = -this.vy;
    }

    if ( y + halfHeight > windowHeight ) {
      y = windowHeight - halfHeight;
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
    anim.update();
    window.requestAnimationFrame( update );
  }

  (function init() {
    // Initialize global animation state.
    anim = new Animation();

    var element = new Element({
        x: 0.5 * window.innerWidth,
        y: 0.5 * window.innerHeight,
        parent: anim
      });

    anim.elements.push( element );
    update();
  }) ();

  Animation.Element = Element;
  return Animation;
}) ( window, document );

/*exported Shared*/
var Shared = (function( window ) {
  'use strict';

  // Prevent scrolling on iOS devices.
  window.addEventListener( 'touchmove', function( event ) {
    event.preventDefault();
  });

  // Utility functions.
  return {
    // In the range [min, max).
    randomInt: function randomInt( min, max ) {
      return Math.round( min + Math.random() * ( max - min ) );
    },

    randomSign: function randomSign() {
      return Math.random() < 0.5 ? -1 : 1;
    }
  };
}) ( window );

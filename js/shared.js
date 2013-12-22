(function( window ) {
  'use strict';

  // Prevent scrolling on iOS devices.
  window.addEventListener( 'touchmove', function( event ) {
    event.preventDefault();
  });
}) ( window );

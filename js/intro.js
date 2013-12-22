(function( window, document, undefined ) {
  'use strict';

  var faceEl = document.querySelector( '.face' );
  if ( !faceEl ) {
    return;
  }

  var transitionClass = 'face-transition';

  function onTransitionEnd( event ) {
    if ( event.target === faceEl ) {
      faceEl.removeEventListener( 'transitionend', onTransitionEnd );
      faceEl.classList.remove( transitionClass );

      window.location = 'index.html';
    }
  }

  function onMouseDown() {
    faceEl.classList.add( transitionClass );
    faceEl.addEventListener( 'transitionend', onTransitionEnd );
  }

  var clickEvent = window.ontouchstart !== undefined ? 'touchstart' : 'mousedown';
  faceEl.addEventListener( clickEvent, onMouseDown );
}) ( window, document );

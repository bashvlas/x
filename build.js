;( function () {

	function X ( window ) {

		var x = {};

		return x;

	};

	( function ( window ) {

		window.x = new X( window );

	} ( window ) );

} () );
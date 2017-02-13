
	function ( obj ) {

		return Object.keys( obj ).map( function ( name ) {

			return encodeURIComponent( name ) + "=" + encodeURIComponent( obj[ name ] );

		}).join( "&" );

	};
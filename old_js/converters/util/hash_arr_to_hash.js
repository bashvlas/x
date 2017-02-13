	
	function ( arr ) {

		var hash = {};

		arr.forEach( function( item ) {

			Object.keys( item ).forEach( function( key ) {

				hash[ key ] = item[ key ];

			});

		});

		return hash;

	};
	
	function ( req ) {

		var obj_1 = req[ 0 ];
		var obj_2 = req[ 1 ];

		Object.keys( obj_2 ).forEach( function ( key ) {

			obj_1[ key ] = obj_2[ key ];

		});

		return obj_1;

	};
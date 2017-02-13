	
	function ( rq, conv ) {

		var obj_1 = rq[ 0 ];
		var obj_2 = rq[ 1 ];

		Object.keys( obj_2 ).forEach( function ( key ) {

			obj_1[ key ] = obj_2[ key ];

		});

		return obj_1;

	};
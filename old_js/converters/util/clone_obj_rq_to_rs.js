
	function ( rq ) {

		var new_obj = {};

		Object.keys( rq.obj ).forEach( function ( key ) {

			if ( rq.exclude_arr.indexOf( key ) === -1 ) {

				new_obj[ key ] = rq.obj[ key ];

			};

		});

		return new_obj;

	};
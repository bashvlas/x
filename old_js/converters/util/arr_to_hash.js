
	function ( rq ) {

		var hash = {};

		rq[ 0 ].forEach( function ( item ) {

			hash[ item[ rq[ 1 ] ] ] = item;

		});

		return hash;

	};
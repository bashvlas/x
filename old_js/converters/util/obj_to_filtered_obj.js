	
	function ( obj ) {

		var keys = Object.keys( obj );

		for ( var i = keys.length; i--; ) {

			if ( !obj[ keys[ i ] ] ) {

				delete obj[ keys[ i ] ];

			};

		};

		return obj;

	};
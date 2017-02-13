	
	function ( hash ) {

		return new Promise( function ( resolve ) {

			var value_hash = {};
			var resolved_promise_count = 0;
			var promise_name_arr = Object.keys( hash );

			promise_name_arr.forEach( function ( promise_name ) {

				hash[ promise_name ].then( function ( value ) {

					value_hash[ promise_name ] = value;
					resolved_promise_count += 1;

					if ( resolved_promise_count === promise_name_arr.length ) {

						resolve( value_hash );

					};

				});

			});

			if ( promise_name_arr.length === 0 ) {

				resolve( value_hash );

			};

		});

	};
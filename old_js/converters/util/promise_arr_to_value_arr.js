	
	function ( arr ) {

		return new Promise( function ( resolve ) {

			var value_arr = [];
			var resolved_promise_count = 0;

			arr.forEach( function ( promise, index ) {

				promise.then( function ( value ) {

					value_arr[ index ] = value;
					resolved_promise_count += 1;

					if ( resolved_promise_count === arr.length ) {

						resolve( value_arr );

					};

				});

			});

			if ( arr.length === 0 ) {

				resolve( value_arr );

			};

		});

	};
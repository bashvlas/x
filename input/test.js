
	window.x.test = ( function () {

		return {

			test: function ( fn, input_url, output_url ) {

				return Promise.all([
				
					x.ajax.fetch({ method: "get_doc", url: input_url }),
					x.ajax.fetch({ method: "get_json", url: output_url }),

				])
				.then( function ( arr ) {

					var input = arr[ 0 ];
					var output = arr[ 1 ];
					var real_output = fn( arr[ 0 ] );

					if ( ) {

						console.log( "GOOD" );

					} else {

						console.log( "BAD" );

					};

				});

			}

		};

	} () );
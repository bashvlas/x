
	function ( rq ) {

		var conv = function ( input_type_name, output_type_name, input ) {

			if ( conv.hash[ input_type_name + "_to_" + output_type_name ] ) {

				// try {

					var output = conv.hash[ input_type_name + "_to_" + output_type_name ]( input, conv );

					if ( output instanceof Promise ) {

						return new Promise( function ( resolve, reject ) {

							output
							.then( function ( output ) {

								resolve( output );

							})
							// .catch( function ( error ) {

							// 	resolve( undefined );

							// });

						});

					} else {

						return output;

					};

				// } catch ( error ) {

				// 	return undefined;

				// };

			} else {

				return undefined;

			};

		};

		conv.hash = rq.conv_hash;
		conv.lib = rq.lib;

		return conv;

	};

	function Converter ( window, conv_hash ) {

		function conv ( input_type_name, output_type_name, input ) {

			console.log( input_type_name, "to", output_type_name );
			console.log( "Input", input );

			if ( conv_hash[ input_type_name + "_to_" + output_type_name ] ) {

				try {

					var output = conv_hash[ input_type_name + "_to_" + output_type_name ]( input );

					if ( output instanceof Promise ) {

						return new Promise( function ( resolve, reject ) {

							output
							.then( function ( output ) {

								console.log( "Output", output );
								resolve( output );

							})
							.catch( function ( error ) {

								console.log( error.stack );
								resolve( undefined );

							});

						});

					} else {


						console.log( "Output", output );
						return output;

					};

				} catch ( error ) {

					console.log( error.stack );
					return undefined;

				};

			} else {

				console.log( "not found" );
				return undefined;

			};

		};

		conv.lib = {

			window: window,
			w: window,
			doc: window.document,
			parser: new DOMParser(),

		};

		return conv;

	};
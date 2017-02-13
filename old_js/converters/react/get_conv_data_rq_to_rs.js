
	function ( rq ) {

		function conv ( input_type_name, output_type_name, input ) {

			var conv_name = input_type_name + "_to_" + output_type_name;
			var conv_data = {

				input_type_name: input_type_name,
				output_type_name: output_type_name,

				conv_data_arr: [],
				found: true,

				input: input,
				output: undefined,

			};

			function pseudo_conv ( input_type_name, output_type_name, input ) {

				var local_conv_data = conv( input_type_name, output_type_name, input );
				conv_data.conv_data_arr.push( local_conv_data );

				return local_conv_data.output;

			};

			pseudo_conv.state = conv.state;

			if ( conv_hash[ conv_name ] ) {

				try {

					conv_data.output = conv_hash[ conv_name ]( input, pseudo_conv );

					if ( conv_data.output instanceof Promise ) {

						conv_data.output = new Promise( function ( resolve ) {

							conv_data.output
							.then( function ( output ) {

								resolve( output );

							})
							.catch( function ( error ) {

								conv_data.error = true;
								conv_data.stack = error.stack;

							});

						});

					};

				} catch ( error ) {

					conv_data.error = true;
					conv_data.stack = error.stack;

				};

			} else {

				conv_data.found = false;

			};

			return conv_data;

		};

		conv.state = {};

		return conv;

	};
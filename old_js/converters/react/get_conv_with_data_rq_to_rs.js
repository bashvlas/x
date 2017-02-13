
	function ( rq ) {

		var conv = function ( input_type_name, output_type_name, input ) {

			var conv_name = input_type_name + "_to_" + output_type_name;
			var conv_data = {

				input_type_name: input_type_name,
				output_type_name: output_type_name,

				conv_data_arr: [],
				found: true,

				input: input,
				output: undefined,

				index: window.dev_data.conv_data_arr.length,

			};

			window.dev_data.conv_data_arr.push( conv_data );

			function pseudo_conv ( input_type_name, output_type_name, input ) {

				// console.log( input_type_name, output_type_name, input );

				var local_conv_data = conv( input_type_name, output_type_name, input );
				conv_data.conv_data_arr.push( local_conv_data );

				return local_conv_data.output;

			};

			pseudo_conv.lib = conv.lib;
			pseudo_conv.hash = rq.conv_hash;

			if ( rq.conv_hash[ conv_name ] ) {

				try {

					conv_data.output = rq.conv_hash[ conv_name ]( input, pseudo_conv );

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

		conv.hash = rq.conv_hash;
		conv.lib = rq.lib;

		return conv;

	};
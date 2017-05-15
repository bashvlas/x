	
	window.x.conv = ( function () {

		// vars

			var converters_hash = {};
			var options = {

				debug: true,

			};

		// util functions

			var conv_with_data = ( function () {

				var conv = function( namespace, from_name, to_name, input ) {

					var conv_hash = converters_hash[ namespace ];
					var conv_name = from_name + "_to_" + to_name;
					var conv_data = {

						from_name: from_name,
						to_name: to_name,

						conv_data_arr: [],
						found: true,

						input: input,
						output: undefined,

					};

					function pseudo_conv ( namespace, from_name, to_name, input ) {

						var local_conv_data = conv( namespace, from_name, to_name, input );
						conv_data.conv_data_arr.push( local_conv_data );

						return local_conv_data.output;

					};

					if ( conv_hash[ conv_name ] ) {

						try {

							conv_data.output = conv_hash[ conv_name ]( input, pseudo_conv );

							if (conv_data.output instanceof Promise) {

								conv_data.output = new Promise( function ( resolve ) {

									conv_data.output
										.then(function(output) {

											resolve(output);

										})
										.catch(function(error) {

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

				return conv;

			} () );

			var conv_no_data = ( function () {

				var conv = function ( namespace, from_name, to_name, input ) {

					var conv_hash = converters_hash[ namespace ];

					if ( conv_hash && conv_hash[ from_name + "_to_" + to_name] ) {

						try {

							var output = conv_hash[ from_name + "_to_" + to_name ]( input, conv );

							if (output instanceof Promise) {

								return new Promise( function( resolve, reject ) {

									output
										.then(function(output) {

											resolve(output);

										})
										.catch(function(error) {

											resolve(undefined);

										});

								});

							} else {

								return output;

							};

						} catch ( error ) {

							return undefined;

						};

					} else {

						return undefined;

					};

				};

				return conv;

			} () );

			function log_conv_data ( conv_data ) {

				if ( conv_data.error ) {

					console.groupCollapsed("%c " + conv_data.from_name + " to " + conv_data.to_name, "color: red");
					console.log(conv_data.input);
					console.log(conv_data.stack);

				} else if (!conv_data.found) {

					console.groupCollapsed("%c " + conv_data.from_name + " to " + conv_data.to_name, "color: #F0AD4E");
					console.log(conv_data.input);

				} else {

					console.groupCollapsed("%c " + conv_data.from_name + " to " + conv_data.to_name, "color: green");
					console.log(conv_data.input);
					console.log(conv_data.output);

				}

				conv_data.conv_data_arr.forEach( function ( conv_data ) {

					log_conv_data( conv_data );

				});

				console.groupEnd();

			};

		// main function

			function conv ( namespace, from_name, to_name, input ) {

				if ( options.debug ) {

					var conv_data = conv_with_data( namespace, from_name, to_name, input );

					log_conv_data( conv_data );

					return conv_data.output;

				} else {

					return conv_no_data( namespace, from_name, to_name, input );

				};

				var fn = converters_hash[ namespace ][ from_name + "_to_" + to_name ];

				return fn( input, conv );

			};

		// helper public functions

			conv.register = function ( namespace, hash ) {

				converters_hash[ namespace ] = hash;

			};

			conv.set_options = function ( new_options ) {

				options = new_options;

			};

		// return

			return conv;

	} () );
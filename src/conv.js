
	window[ window.webextension_library_name ].conv = ( function () {

		// define x

			var x = window[ window.webextension_library_name ];
			var _app = null;

		// vars

			var converters_hash = {};
			var options = {

				mode: "prod",
				silence: [],

			};

		// util functions

			var conv_with_data = ( function () {

				var conv = function( namespace, from_name, to_name, input ) {

					var conv_hash = converters_hash[ namespace ];
					var conv_name = from_name + "_to_" + to_name;
					var conv_data = {

						namespace: namespace,
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

		// main function

			function conv ( namespace, from_name, to_name, input ) {

				if ( options.mode === "dev" ) {

					var conv_data = conv_with_data( namespace, from_name, to_name, input );

					if ( options.silence && options.silence.indexOf( from_name + "_to_" + to_name ) === -1 ) {

						_app.log.log_conv_data( conv_data );

					};

					return conv_data.output;

				} else if ( options.mode === "prod" ) {

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

				_app = new_options.app;

				options = new_options;

			};

			conv.get_conv_data = conv_with_data;

		// return

			return conv;

	} () );

	window[ window.webextension_library_name ].convert = ( function ( input, data_arr ) {

		var x = window[ window.webextension_library_name ];

		try {

			var output = input;

			if ( data_arr ) {

				for ( var i = 0; i < data_arr.length; i++ ) {

					conv_data = data_arr[ i ];

					// object_property

					if ( conv_data[ 0 ] === "object_property" ) {

						output = output[ conv_data[ 1 ] ];

					} else if ( conv_data[ 0 ] === "property_path" ) {

						var path = conv_data[ 1 ].split( '.' );

						for ( var i = 0; i < path.length; i++ ) {

							output = output[ path[ i ] ];

						};

					} else if ( conv_data[ 0 ] === "array_item" ) {

						output = output[ conv_data[ 1 ] ];

					}

					// execute_method

					else if ( conv_data[ 0 ] === "execute_method" ) {

						output = output[ conv_data[ 1 ] ]( conv_data[ 2 ], conv_data[ 3 ], conv_data[ 4 ] );

					} else if ( conv_data[ 0 ] === "match" ) {

						output = output.match( conv_data[ 1 ] );

					} else if ( conv_data[ 0 ] === "query_selector" ) {

						output = output.querySelector( conv_data[ 1 ] );

					} else if ( conv_data[ 0 ] === "get_attribute" ) {

						output = output.getAttribute( conv_data[ 1 ] );

					} else if ( conv_data[ 0 ] === "trim" ) {

						output = output.trim();

					} else if ( conv_data[ 0 ] === "split" ) {

						output = output.split( conv_data[ 1 ] );

					} else if ( conv_data[ 0 ] === "replace" ) {

						output = output.replace( conv_data[ 1 ], conv_data[ 2 ] );

					}

					// other

					else if ( conv_data[ 0 ] === "prepend" ) {

						output = conv_data[ 1 ] + output;

					} else if ( conv_data[ 0 ] === "decode_uri" ) {

						output = decodeURIComponent( output );

					} else if ( conv_data[ 0 ] === "decode_json" ) {

						output = JSON.parse( output );

					} else if ( conv_data[ 0 ] === "encode_json" ) {

						output = JSON.stringify( output );

					} else if ( conv_data[ 0 ] === "simplify" ) {

						var depth = conv_data[ 1 ];

						if ( typeof depth !== "number" || depth === 0 ) {

							return "...";

						} else if (
							output instanceof Function ||
							output instanceof Element ||
							output instanceof Window
						) {

							output = "***";

						} else if ( typeof output === "object" && output !== null ) {

							if ( typeof output.serialize === 'function' ) {

								output = output.serialize();

							} else if ( output instanceof Array ) {

								var new_output = [];

								output.forEach( ( output_item, index ) => {

									new_output[ index ] = x.convert( output_item, [
										[ "simplify", depth - 1 ],
									]);

								});

								output = new_output;

							} else if ( output.postMessage ) {

								return "***";

							} else {

								var new_output = {};

								Object.keys( output ).forEach( ( key ) => {

									new_output[ key ] = x.convert( output[ key ], [
										[ "simplify", depth - 1 ],
									]);

								});

								output = new_output;

							};

						} else {

							// don't do anything

						};

					} else if ( conv_data[ 0 ] === "clone" ) {

						output = jQuery.extend( true, {}, output );

					} else if ( conv_data[ 0 ] === "bool" ) {

						output = !!output;

					}  else if ( conv_data[ 0 ] === "if_falsy" ) {

						if ( !output ) {

							output = conv_data[ 1 ];

						};

					} else if ( conv_data[ 0 ] === "list_to_arr" ) {

						var arr = [];

						for ( var j = 0; j < output.length; j++ ) {

							arr.push( output[ j ] );

						};

						output = arr;

					} else if ( conv_data[ 0 ] === "concat" ) {

						output = output.concat( conv_data[ 1 ] );

					}

					// map

					else if ( conv_data[ 0 ] === "map" ) {

						var new_arr = [];
						var convesion_settings = conv_data[ 1 ];

						for ( var j = 0; j < output.length; j++ ) {

							var new_output_item = x.convert( output[ j ], convesion_settings );

							new_arr.push( new_output_item );

						};

						output = new_arr;

					};

				};

			};

			return output;

		} catch ( e ) {

			return null;

		};

	});

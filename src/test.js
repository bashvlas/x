
	window[ window.webextension_library_name ].tester = ( function () {

		var x = window[ window.webextension_library_name ];

		return {

			test_conv: async function ( conv_name, json_url ) {

				var test_info = await x.ajax({ method: "get_json", url: json_url });

				var conv_fn_name_arr = Object.keys( test_info );

				for ( var i = 0; i < conv_fn_name_arr.length; i++ ) {

					var conv_fn_name = conv_fn_name_arr[ i ];
					var test_data_arr = test_info[ conv_fn_name ];

					for ( var j = 0; j < test_data_arr.length; j++ ) {

						var test_data = test_data_arr[ j ];

						var input_name = conv_fn_name.split( "_to_" )[ 0 ];
						var output_name = conv_fn_name.split( "_to_" )[ 1 ];

						var io = await Promise.all([

							x.tester.unserialize( test_data.input ),
							x.tester.unserialize( test_data.output )

						]);

						var input = io[ 0 ];
						var output = io[ 1 ];

						var conv_data = x.conv.get_conv_data( conv_name, input_name, output_name, input );
						var equal_bool = x.tester.compare( output, conv_data.output );

						x.tester.log_test_case( conv_data, input, output, equal_bool );

					};

				};

			},

			unserialize: function ( data ) {

				return new Promise( function ( resolve ) {

					if ( data === null || typeof data !== "object" ) {

						resolve( data );

					} else if ( data.__serial_type__ === "element" ) {

						resolve( x.tester.html_to_element( data.html ) );

					} else if ( data.__serial_type__ === "date" ) {

						resolve( new Date( data.ts ) );

					} else if ( data.__serial_type__ === "page_data" ) {

						x.ajax({

							method: "get_text",
							url: "pages/" + encodeURIComponent( encodeURIComponent( data.url ) ),

						}).then( function ( text ) {

							resolve({

								url: data.url,
								text: text,
								doc: x.util.html_to_doc( text ),

							});

						});

					} else if ( data.__link_to_this_object__ ) {

						x.ajax({

							method: "get_json",
							url: data.__link_to_this_object__,

						}).then( function ( json ) {

							resolve( json );

						});

					} else if ( data.__link_to_this_text__ ) {

						x.ajax({

							method: "get_text",
							url: data.__link_to_this_text__,

						}).then( function ( text ) {

							resolve( text );

						});

					} else {

						var total_key_count = Object.keys( data ).length;
						var unserialized_key_count = 0;

						Object.keys( data ).forEach( function ( key ) {

							x.tester.unserialize( data[ key ] )
							.then( function ( value ) {

								data[ key ] = value;

								unserialized_key_count += 1;

								if ( unserialized_key_count === total_key_count ) {

									resolve( data );

								};

							});

						});

						if ( Object.keys( data ).length === 0 ) {

							resolve( data );

						};

					};

				});

			},

			html_to_element: function ( html ) {

				var parser = new DOMParser;
				var dom = parser.parseFromString( html, 'text/html');

				return dom.body.firstElementChild;

			},

			compare: function ( obj_1, obj_2 ) {

				if ( obj_1 === obj_2 ) {

					return true;

				} else if ( obj_1 instanceof Date && obj_2 instanceof Date ) {

					return obj_1.getTime() === obj_2.getTime();

				} else if ( obj_1 === null && obj_2 === null ) {

					return true;

				} else if ( typeof obj_1 === "object" && typeof obj_2 === "object" && obj_1 !== null && obj_2 !== null ) {

					var key_arr_1 = Object.keys( obj_1 );
					var key_arr_2 = Object.keys( obj_2 );
					var equal;

					for ( var i = key_arr_1.length; i--; ) {

						equal = x.tester.compare( obj_1[ key_arr_1[ i ] ], obj_2[ key_arr_1[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					for ( var i = key_arr_2.length; i--; ) {

						equal = x.tester.compare( obj_1[ key_arr_2[ i ] ], obj_2[ key_arr_2[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					return true;

				} else {

					return false;

				};

			},

			log_test_case: function ( conv_data, input, output, equal_bool ) {

				var style = equal_bool ? "color:green" : "color:red";

				console.groupCollapsed( "%c " + conv_data.namespace + ": " + conv_data.from_name + " => " + conv_data.to_name, style );

				console.log( input );
				console.log( output );
				console.log( conv_data.output );

				x.log.log_conv_data( conv_data );

				console.groupEnd();

			}

		};

	} () );

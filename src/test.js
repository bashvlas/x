
	window.x.tester = ( function () {

		return {

			test_conv: function ( conv_name, json_url ) {

				x.ajax({ method: "get_json", url: json_url })
				.then( function ( test_data ) {

					Object.keys( test_data ).forEach( function ( conv_fn_name ) {

						test_data[ conv_fn_name ].forEach( function ( test_data ) {

							var input_name = conv_fn_name.split( "_to_" )[ 0 ];
							var output_name = conv_fn_name.split( "_to_" )[ 1 ];

							var input = x.tester.unserialize( test_data.input );
							var output = x.tester.unserialize( test_data.output );

							var conv_data = x.conv.get_conv_data( conv_name, input_name, output_name, input );
							var equal_bool = x.tester.compare( output, conv_data.output );

							x.tester.log_test_case( conv_data, input, output, equal_bool );

						});

					});

				});

			},

			unserialize: function ( data ) {

				if ( data === null || typeof data !== "object" ) {

					return data;

				} else if ( data.__serial_type__ === "element" ) {

					return x.tester.html_to_element( data.html );

				} else if ( data.__serial_type__ === "date" ) {

					return new Date( data.ts );

				} else {

					Object.keys( data ).forEach( function ( key ) {

						data[ key ] = x.tester.unserialize( data[ key ] );

					});

					return data;

				};

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

				x.conv.log_conv_data( conv_data );

				console.groupEnd();

			}

		};

	} () );
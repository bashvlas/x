
	window.x.test = ( function () {

		return {

			test: function ( fn_name, fn, input_url, output_url ) {

				return Promise.all([
				
					x.ajax.fetch({ method: "get_doc", url: input_url }),
					x.ajax.fetch({ method: "get_json", url: output_url }),

				])
				.then( function ( arr ) {

					var input = arr[ 0 ].body.firstElementChild;
					var output = arr[ 1 ];
					var real_output = fn( arr[ 0 ] );
					var equal_bool = x.test.compare( output, real_output );

					x.test.log_test_case( fn_name, input, output, real_output, equal_bool );

				});

			},

			compare: function ( obj_1, obj_2 ) {

				if ( obj_1 === obj_2 ) {

					return true;

				} else if ( obj_1 === null && obj_2 === null ) {

					return true;

				} else if ( typeof obj_1 === "object" && typeof obj_2 === "object" ) {

					var key_arr_1 = Object.keys( obj_1 );
					var key_arr_2 = Object.keys( obj_2 );
					var equal;

					for ( var i = key_arr_1.length; i--; ) {

						equal = x.test.compare( obj_1[ key_arr_1[ i ] ], obj_2[ key_arr_1[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					for ( var i = key_arr_2.length; i--; ) {

						equal = x.test.compare( obj_1[ key_arr_2[ i ] ], obj_2[ key_arr_2[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					return true;

				} else {

					return false;

				};

			},

			log_test_case: function ( fn_name, input, output, real_output, equal_bool ) {

				var style = equal_bool ? "color:green" : "color:red";

				console.groupCollapsed( "%c " + fn_name, style );
			
				console.log( input );
				console.log( output );
				console.log( real_output );

				console.groupEnd();

			}

		};

	} () );
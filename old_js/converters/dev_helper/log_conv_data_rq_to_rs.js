
	function ( conv_data, conv ) {

		// log metadata

			var log_str = "%c " + conv_data.input_type_name + " to " + conv_data.output_type_name + " " + ( conv_data.index || "" );

			if ( conv_data.error ) {

				console.groupCollapsed( log_str, "color: red" );
				console.groupCollapsed( "%c meta", "color: brown" );

				// console.log( window.dev_data.subl_url_hash[ conv_data.input_type_name + "_to_" + conv_data.output_type_name ]);
				console.log( conv_data.input );
				console.log( conv_data.stack );

			} else if ( !conv_data.found ) {

				console.groupCollapsed( log_str, "color: #F0AD4E" );
				console.groupCollapsed( "%c meta", "color: brown" );

				// console.log( window.dev_data.subl_url_hash[ conv_data.input_type_name + "_to_" + conv_data.output_type_name ]);
				console.log( conv_data.input );
				
			} else {

				console.groupCollapsed( log_str, "color: green" );
				console.groupCollapsed( "%c meta", "color: brown" );

				// console.log( window.dev_data.subl_url_hash[ conv_data.input_type_name + "_to_" + conv_data.output_type_name ]);
				console.log( conv_data.input );
				console.log( conv_data.output );
				
			};

			console.groupEnd();

		//

		// log subsequent conv_data

			console.groupCollapsed( "%c called", "color: brown" );
			
			console.log( conv_data.conv_data_arr );
			
			conv_data.conv_data_arr.forEach( function ( conv_data ) {

				conv( "log_conv_data_rq", "rs", conv_data );

			});

			console.groupEnd();

		//

		console.groupEnd();

	};
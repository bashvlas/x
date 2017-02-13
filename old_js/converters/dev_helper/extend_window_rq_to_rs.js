
	function ( window ) {

		var chrome = window.chrome;

		window.r = function () {

			window.chrome.runtime.reload();

		};

		window.relog = function () { // log conv_data_arr

			window.dev_data.event_obj_conv_data_arr.forEach( function ( conv_data ) {

				window.conv( "log_conv_data_rq", "rs", conv_data );

			});

		};

		window.stc = function ( index ) { // save test case

			// create test_case

				var conv_data = window.dev_data.conv_data_arr[ index ];
				var test_case = window.conv( "serialize_obj_rq", "rs", {

					extension_name: window.dev_data.extension_name,

					input_type_name: conv_data.input_type_name,
					output_type_name: conv_data.output_type_name,

					input: conv_data.input,
					output: conv_data.output

				});

			// save test_case

				chrome.runtime.sendMessage( "lnncfdlfehhfdmopjpdmkidpcenkdijg", {

					name: "save_test_case",
					test_case: test_case,

				});

			//

		};

		// create conv.lib.cs

			window.conv.lib.cs = function ( tab_id, input_type_name, output_type_name, input ) {

				if ( tab_id === "*" ) {

					var promise_arr = [];

					chrome.tabs.query( {}, function ( tab_arr ) {

						tab_arr.forEach( function ( tab ) {

							promise_arr.push( window.conv.lib.cs( tab.id, input_type_name, output_type_name, input ) );

						});

					});

					return window.conv( "promise_arr", "value_arr", promise_arr );

				} else {

					return new Promise( function ( resolve ) {

						chrome.tabs.sendMessage(

							tab_id,
							{
								_origin_: "conv",
								input_type_name: input_type_name,
								output_type_name: output_type_name,
								input: input
							},
							function ( response ) {

								resolve( response );

							}

						);

					});

				};

			};

			window.conv.lib.rt = function ( input_type_name, output_type_name, input ) {

				return new Promise( function ( resolve ) {

					chrome.runtime.sendMessage(

						{
							_origin_: "conv",
							input_type_name: input_type_name,
							output_type_name: output_type_name,
							input: input
						},
						function ( response ) {

							resolve( response );

						}

					);

				});

			};

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message && message._origin_ === "conv" ) {

					if ( conv.lib.state.config.build_name === "dev" ) console.log( "MESSAGE", message );

					if ( message.input_type_name === "get_tab_id_rq" ) {

						callback( sender.tab.id );

					} else {

						var output = window.conv( message.input_type_name, message.output_type_name, message.input );

						if ( output instanceof Promise ) {

							output.then( function ( output ) {

								if ( conv.lib.state.config.build_name === "dev" ) console.log( "OUTPUT", output );
								callback( output );

							});
							
							return true;

						} else {
							
							if ( conv.lib.state.config.build_name === "dev" ) console.log( "OUTPUT", output );
							callback( output );

						};

					};

				};

			});

		// register this extension

			// window.chrome.runtime.sendMessage( "lnncfdlfehhfdmopjpdmkidpcenkdijg", {

			// 	name: "register"

			// });

		return window;

	};

	window[ window.webextension_library_name ].chrome_p = ( function () {

		function callback_handler ( resolve, response ) {

			if ( chrome.runtime.lastError ) {

				console.log( chrome.runtime.lastError );

				resolve( null );

			} else {

				resolve( response );

			};

		};

		return {

			storage: {

				local: {

					get: ( input ) => {

						return new Promise( ( resolve ) => {

							chrome.storage.local.get( input, resolve );

						});

					},

					set: ( input ) => {

						return new Promise( ( resolve ) => {

							chrome.storage.local.set( input, resolve );

						});

					},

				},

			},

			contextMenus: {

				removeAll: function () {

					return new Promise( ( resolve ) => {

						chrome.contextMenus.removeAll( resolve );

					});

				},

				create: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.contextMenus.create( input, resolve );

					});

				},

			},

			tabs: {

				executeScript: function ( input_1, input_2 ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.executeScript( input_1, input_2, callback_handler.bind( null, resolve ) );

					});

				},

				sendMessage: function ( input_1, input_2 ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.sendMessage( input_1, input_2, callback_handler.bind( null, resolve ) );

					});

				},

				get: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.get( input, callback_handler.bind( null, resolve ) );

					});

				},

				remove: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.remove( input, callback_handler.bind( null, resolve ) );

					});

				},

				query: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.query( input, resolve );

					});

				},

				create: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.create( input, resolve );

					});

				},

				update: function ( input_1, input_2 ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.update( input_1, input_2, resolve );

					});

				},

			},

		};

	} () );

	window[ window.webextension_library_name ].modules.chrome = function () {

		function callback_handler ( resolve, response ) {

			if ( chrome.runtime.lastError ) {

				console.log( chrome.runtime.lastError );

				resolve( null );

			} else {

				resolve( response );

			};

		};

		return {

			call: function () {

				return new Promise( ( resolve ) => {

					var path = arguments[ 0 ];
					var path_arr = path.split( "." );
					var object = chrome;
					var object_context = chrome;

					for ( var i = 0; i < path_arr.length; i++ ) {

						object = object[ path_arr[ i ] ];

					};

					for ( var i = 0; i < path_arr.length - 1; i++ ) {

						object_context = object_context[ path_arr[ i ] ];

					};

					var new_arguments = [];

					for ( var i = 0; i < arguments.length; i++ ) {

						new_arguments.push( arguments[ i ] );

					};

					new_arguments.push( callback_handler.bind( null, resolve ) );

					object.apply( object_context, new_arguments.slice( 1 ) );

				});

			},

		};

	};

	window[ window.webextension_library_name ].modules.state = function () {

		var state = {};

		return {

			get: function ( property_path ) {

				var path_item_arr = property_path.split( "." );
				var output = state;

				for ( var i = 0; i < path_item_arr.length; i++ ) {

					if ( output[ path_item_arr[ i ] ] ) {

					} else {

						output = null;

					};

				};

				return output

			},

			set: function ( property_path, value ) {

				var object = state;
				var path_item_arr = property_path.split( "." );
				var key = path_item_arr[ 0 ];

				for ( var i = 0; i < path_item_arr.length - 1; i++ ) {

					if ( object[ path_item_arr[ i ] ] ) {

						object = ;

					};

					var key = path_item_arr[ i + 1 ];

				};

			},

		};

	};

	window[ window.webextension_library_name ].modules.exec = function () {

		var modules = {

		};

		var _priv = {

			exec: function () {

				var module_name = arguments[ 0 ];
				var method_name = arguments[ 1 ];

				var new_arguments = [];

				for ( var i = 0; i < arguments.length; i++ ) {

					new_arguments.push( arguments[ i ] );

				};

				new_arguments.push( _priv.exec );

				var output = modules[ module_name ][ method_name ].apply( null, new_arguments.slice( 2 ) );

				if ( output && typeof output.then === 'function' ) {

					output.then( ( result ) => {

						console.log( "exec", new_arguments, result );

					})

					return output;

				} else {

					console.log( "exec", new_arguments, output );

					return output;

				};

			},

		};

		var pub = {

			get_exec: () => {

				return _priv.exec;

			},

			add_module: ( name, module ) => {

				modules[ name ] = module;

			},

		};

		return pub;

	};

	window[ window.webextension_library_name ].modules.exec_tester = function () {

		var x = window[ window.webextension_library_name ];

		var _state = {

			service_hash: {}

		};

		var _priv = {


		};

		var _pub = {

			exec: ( service_name, method_name, input_data ) => {

				return _state.service_hash[ service_name ][ method_name ]( input_data, service_hub );

			},

			register: ( service_name, method_hash ) => {

				_state.service_hash[ service_name ] = method_hash;

			},

			test_service: async ( service_name, test_case_url ) => {

				var test_case_data_arr_hash = await x.ajax({ method: "get_json", url: test_case_url });
				var method_name_arr = Object.keys( test_case_data_arr_hash );

				for ( var i = 0; i < method_name_arr.length; i++ ) {

					var method_name = method_name_arr[ i ];
					var test_case_data_arr = test_case_data_arr_hash[ method_name ];

					for ( var j = 0; j < test_case_data_arr.length; j++ ) {

						var test_case_data = test_case_data_arr[ j ];

						var test_result = await x.service_hub.test( service_name, method_name, test_case_data );

						x.service_hub.log_test_result( test_result );

					};

				};

			},

			test: async ( service_name, method_name, test_case_data ) => {

				var input_data = test_case_data.input_data;
				var expected_log = test_case_data.expected_log;
				var expected_output_data = test_case_data.output_data;

				var call_index = 0;
				var fn = _state.service_hash[ service_name ][ method_name ];
				var actual_log = [];

				var actual_output_data = fn( input_data, ( service_name, method_name, input_data ) => {

					var expected_response = expected_log[ call_index ][ 3 ];
					var async_flag = expected_log[ call_index ][ 4 ];

					actual_log.push([ service_name, method_name, input_data, expected_response, async_flag ]);

					call_index += 1;

					if ( async_flag ) {

						return Promise.resolve( expected_response );

					} else {

						return expected_response;

					};

				});

				if ( typeof actual_output_data.then === 'function' ) {

					actual_output_data = await actual_output_data;

				};

				var test_result = {};

				test_result.service_name = service_name;
				test_result.method_name = method_name;

				test_result.input_data = input_data;
				test_result.expected_output_data = expected_output_data;
				test_result.actual_output_data = actual_output_data;

				test_result.log_is_valid = x.tester.compare( expected_log, actual_log );
				test_result.output_is_valid = x.tester.compare( expected_output_data, actual_output_data );

				test_result.expected_log = expected_log;
				test_result.actual_log = actual_log;

				// expected_log.forEach( ( item, index ) => {

				// 	console.log( x.tester.compare( expected_log[ index ], actual_log[ index ] ) );

				// });

				return test_result;

			},

			log_test_result: ( test_result ) => {

				var title = "%c " + test_result.service_name + ": " + test_result.method_name;

				if ( test_result.log_is_valid && test_result.output_is_valid ) {

					console.groupCollapsed( title, "color: green" );

					console.log( "input_data", );
					console.log( test_result.input_data );

					console.log( "expected_log", );
					console.log( test_result.expected_log );

					console.log( "actual_log", );
					console.log( test_result.actual_log );

					console.log( "expected_output_data", );
					console.log( test_result.expected_output_data );

					console.log( "actual_output_data", );
					console.log( test_result.actual_output_data );

				} else {

					console.groupCollapsed( title, "color: red" );

					console.log( "input_data", );
					console.log( test_result.input_data );

					console.log( "expected_log", );
					console.log( test_result.expected_log );

					console.log( "actual_log", );
					console.log( test_result.actual_log );

					console.log( "expected_output_data", );
					console.log( test_result.expected_output_data );

					console.log( "actual_output_data", );
					console.log( test_result.actual_output_data );

				};

				console.groupEnd();

			},

			// module testing

			test_module: async ( module_instance, module_name, test_case_url ) => {

				var test_case_data_arr_hash = await x.ajax({ method: "get_json", url: test_case_url });
				var method_name_arr = Object.keys( test_case_data_arr_hash );

				for ( var i = 0; i < method_name_arr.length; i++ ) {

					var method_name = method_name_arr[ i ];
					var test_case_data_arr = test_case_data_arr_hash[ method_name ];

					for ( var j = 0; j < test_case_data_arr.length; j++ ) {

						var test_case_data = test_case_data_arr[ j ];

						var test_result = await x.service_hub.test_method( module_instance, module_name, method_name, test_case_data );

						x.service_hub.log_test_method_result( test_result );

					};

				};

			},

			test_method: async ( module_instance, module_name, method_name, test_case_data ) => {

				var input_data = test_case_data.input_data;
				var expected_log = test_case_data.expected_log;
				var expected_output_data = test_case_data.output_data;

				var call_index = 0;
				var fn = module_instance[ "_priv" ][ method_name ];
				var actual_log = [];
				var test_result = {};

				try {

					var actual_output_data = fn( input_data, ( service_name, method_name, input_data ) => {

						var expected_response = expected_log[ call_index ][ 3 ];
						var async_flag = expected_log[ call_index ][ 4 ];

						actual_log.push([ service_name, method_name, input_data, expected_response, async_flag ]);

						call_index += 1;

						if ( async_flag ) {

							return Promise.resolve( expected_response );

						} else {

							return expected_response;

						};

					});

					if ( typeof actual_output_data.then === 'function' ) {

						actual_output_data = await actual_output_data;

					};

				} catch ( e ) {

					var actual_output_data = null;
					test_result.error = e;

				};

				test_result.module_name = module_name;
				test_result.method_name = method_name;

				test_result.input_data = input_data;
				test_result.expected_output_data = expected_output_data;
				test_result.actual_output_data = actual_output_data;

				test_result.log_is_valid = x.tester.compare( expected_log, actual_log );
				test_result.output_is_valid = x.tester.compare( expected_output_data, actual_output_data );

				test_result.expected_log = expected_log;
				test_result.actual_log = actual_log;

				// expected_log.forEach( ( item, index ) => {

				// 	console.log( x.tester.compare( expected_log[ index ], actual_log[ index ] ) );

				// });

				return test_result;

			},

			log_test_method_result: ( test_result ) => {

				var title = "%c " + test_result.module_name + ": " + test_result.method_name;

				if ( test_result.log_is_valid && test_result.output_is_valid ) {

					console.groupCollapsed( title, "color: green" );

					console.log( "input_data", );
					console.log( test_result.input_data );

					console.log( "expected_log", );
					console.log( test_result.expected_log );

					console.log( "actual_log", );
					console.log( test_result.actual_log );

					console.log( "expected_output_data", );
					console.log( test_result.expected_output_data );

					console.log( "actual_output_data", );
					console.log( test_result.actual_output_data );

				} else {

					console.groupCollapsed( title, "color: red" );

					console.log( "input_data", );
					console.log( test_result.input_data );

					console.log( "expected_log", );
					console.log( test_result.expected_log );

					console.log( "actual_log", );
					console.log( test_result.actual_log );

					console.log( "expected_output_data", );
					console.log( test_result.expected_output_data );

					console.log( "actual_output_data", );
					console.log( test_result.actual_output_data );

					if ( test_result.error ) {

						console.error( test_result.error );

					};

				};

				console.groupEnd();

			},

		};

		return _pub;

	};
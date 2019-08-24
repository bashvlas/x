
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

		var _app = null;

		function callback_handler ( path, resolve, response ) {

			if ( chrome.runtime.lastError ) {

				_app.log( "runtime_last_error", path, chrome.runtime.lastError );

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

					for ( var i = 0; i < arguments.length - 1; i++ ) {

						new_arguments.push( arguments[ i ] );

					};

					new_arguments.push( callback_handler.bind( null, path, resolve ) );

					object.apply( object_context, new_arguments.slice( 1 ) );

				});

			},

			init: function ( app ) {

				_app = app;

			},

		};

	};

	window[ window.webextension_library_name ].modules.state = function () {

		var state = {};

		return {

			get: function ( key ) {

				return state[ key ];

			},

			set: function ( key, value ) {

				state[ key ] = value;

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

				// console.log( "exec_start", module_name, method_name );

				var new_arguments = [];

				for ( var i = 0; i < arguments.length; i++ ) {

					new_arguments.push( arguments[ i ] );

				};

				new_arguments.push( _priv.exec );

				var output = modules[ module_name ][ method_name ].apply( null, new_arguments.slice( 2 ) );

				// console.log( "exec_output", module_name, method_name, output)

				if ( output && typeof output.then === 'function' ) {

					return new Promise( ( resolve ) => {

						output.then( ( result ) => {

							// console.log( "exec_end", new_arguments, result );

							resolve( output );

						}).catch( ( error ) => {

							console.log( error );

							resolve( null );

						});

					});

				} else {

					// console.log( "exec_end", new_arguments, output );

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

	window[ window.webextension_library_name ].modules.hub = function () {

		var x = window[ window.webextension_library_name ];

		var _app = null;
		var state = {};
		var events = {};
		var complex_events = {};
		var default_options = {

			mute_in_log_event_name_arr: [],

		};

		state.mode = "dev";
		state.options = default_options;

		function add_one ( name, observer ) {

			if ( typeof events[ name ] === 'undefined' ) {

				events[ name ] = [];

			}

			events[ name ].push( observer );

		};

		function add_one_observer ( observers_name, name, observer ) {

			if ( typeof complex_events[ name ] === 'undefined' ) {

				complex_events[ name ] = [];

			}

			complex_events[ name ].push({

				observers_name: observers_name,
				observer_fn: observer,

			});

		};

		function remove ( name ) {

			events[ name ] = undefined;

		};

		return {

			init: function ( app ) {

				_app = app;

				state.mode = _app.config.mode;

			},

			fire: function ( name, data ) {

				if ( typeof events[ name ] !== 'undefined' ) {

					data = data ? data : {};
					data.event_name = name;

					events[ name ].forEach( function ( observer ) {

						_app.log.log_event( "hub", "listener", name, data );
						observer( data );

					});

				};

				if ( typeof complex_events[ name ] !== 'undefined' ) {

					data = data ? data : {};
					data.event_name = name;

					complex_events[ name ].forEach( function ( observer ) {

						_app.log.log_event( "hub", observer.observers_name, name, data );
						observer.observer_fn( data );

					});

				};

			},

			add: function ( observers ) {

				Object.keys( observers ).forEach( function ( name ) {

					add_one( name, observers[ name ] );

				});

			},

			add_observers: function ( observers_name, observers ) {

				Object.keys( observers ).forEach( function ( name ) {

					add_one_observer( observers_name, name, observers[ name ] );

				});

			},

			send_runtime_message_rq_to_rs: function ( rq ) {

				window.chrome.runtime.sendMessage( rq );

			},

			send_tab_message_rq_to_rs: function ( req ) {

				if ( req.all_tabs_flag ) {

					window.chrome.tabs.query( {}, function ( tab_arr ) {

						tab_arr.forEach( function ( tab ) {

							window.chrome.tabs.sendMessage( tab.id, req );

						});

					});

				} else {

					return new Promise( function ( resolve ) {

						window.chrome.tabs.sendMessage( req.tab_id, req, resolve );

					});

				};

			},

			add_window_observers: function ( window, context, sender, observers ) {

				window.addEventListener( "message", function ( event ) {

					if ( event.data && event.data.context === context ) {

						var name = event.data.name;
						var data = event.data.data;

						if ( event.data.sender === sender ) {

							if ( observers[ "all" ] ) {

								_app.log.log_event( "window", context + " " + sender, name, data );
								observers[ "all" ]( data, event );

							};

							if ( observers[ name ] ) {

								_app.log.log_event( "window", context + " " + sender, name, data );
								observers[ name ]( data, event );

							};

						};

					};

				});

			},

			add_runtime_observers: function ( observers_name, observers ) {

				chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

					if ( message && message.name ) {

						var name = message.name;
						var data = message.data;

						if ( observers[ "all" ] ) {

							_app.log.log_event( "runtime", observers_name, name, data );
							observers[ "all" ]( data, sender, callback );

						};

						if ( observers[ name ] ) {

							_app.log.log_event( "runtime", observers_name, name, data );
							observers[ name ]( data, sender, callback );

						};

					};

				});

			},

			find_and_add_event_listeners: function ( element ) {

				var _this = this;

				$( element ).on( "click", "[data-onclick]", function ( event ) {

					_this.fire( event.currentTarget.dataset.onclick, event );

				});

			},

			message_window: function ( window, context, sender, name, data ) {

				window.postMessage({

					context: context,
					sender: sender,
					name: name,
					data: data,

				}, "*" );

			},

			send_to_active_tab: function ( name, data, callback ) {

				if ( state.mode === "dev" ) {

					var title = "%c " + "OUT" + ": " + name;

					console.groupCollapsed( title, "color: brown" );
					console.log( data );
					console.groupEnd();

				};

				chrome.tabs.query( { active: true, currentWindow: true }, function ( tab_arr ) {

					chrome.tabs.sendMessage( tab_arr[ 0 ].id, {

						name: name,
						data: data,

					}, function ( response ) {

						if ( state.mode === "dev" ) {

							var title = "%c " + "OUT RESPONSE" + ": " + name;

							console.groupCollapsed( title, "color: brown" );
							console.log( response );
							console.groupEnd();

						};

						if ( callback ) {

							callback( response );

						};

					});

				});

			},

			set_mode: ( mode ) => {

				state.mode = mode;

			},

			set_options: ( options ) => {

				state.options = options;

			},

		};

	};

	window[ window.webextension_library_name ].modules.log = function () {

		var x = window[ window.webextension_library_name ];

		var state = {

			log_item_arr: [],

		};

		var default_options = {

			mute_in_log_event_name_arr: [],

		};

		// write log item

		function write_log_item ( log_item ) {

			if ( log_item.type === "normal" ) {

				var title = "%c " + log_item.app_name + " | " + log_item.arguments[ 0 ];

				console.groupCollapsed( title, "color: black" );

				for ( var i = 1; i < log_item.arguments.length; i ++ ) {

					console.log( log_item.arguments[ i ] );

				};

				console.groupEnd();

			} else if ( log_item.type === "conv_data" ) {

				var conv_data = log_item.conv_data;
				var title = "%c " + log_item.app_name + " | " + conv_data.namespace + ": " + conv_data.from_name + " => " + conv_data.to_name;

				if ( conv_data.error ) {

					console.groupCollapsed( title, "color: red" );
					console.log(conv_data.input);
					console.log(conv_data.stack);

				} else if (!conv_data.found) {

					console.groupCollapsed( title, "color: #F0AD4E" );
					console.log(conv_data.input);

				} else {

					console.groupCollapsed( title, "color: green" );
					console.log(conv_data.input);
					console.log(conv_data.output);

				};

				// log simple string for testing

					console.groupCollapsed( title, "color: grey" );

					console.log( JSON.stringify({

						input: conv_data.input,
						output: conv_data.output,

					}, null, "\t" ) );

					console.groupEnd();

				conv_data.conv_data_arr.forEach( function ( conv_data ) {

					write_log_item({

						type: "conv_data",
						conv_data: conv_data,

					});

				});

				console.groupEnd();

			} else if ( log_item.type === "event" ) {

				var title = "%c " + log_item.app_name + " | " + log_item.listener + " ( " + log_item.source + " )" + ": " + log_item.name;

				console.groupCollapsed( title, "color: blue" );
				console.log( log_item.data );
				console.groupEnd();

			};


		};

		// log type = normal

		var fn = function () {

			var log_item = {

				type: "normal",
				app_name: state.app.name,

				arguments: x.convert( arguments, [[ "list_to_arr" ]] ),

			};

			if ( state.app.report_manager ) {

				state.app.report_manager.store_log_item( log_item ); 

			};

			if ( state.mode === "dev" ) {

				write_log_item( log_item )

			};

		};

		// log type = conv_data

		fn.log_conv_data = function ( conv_data ) {

			var log_item = {

				type: "conv_data",
				app_name: state.app.name,

				conv_data,

			};

			if ( state.app.report_manager ) {

				state.app.report_manager.store_log_item( log_item );

			};

			if ( state.mode === "dev" ) {

				write_log_item( log_item )

			};

		};

		// log type = event

		fn.log_event = function ( source, listener, name, data ) {

			var log_item = {

				type: "event",
				app_name: state.app.name,

				source,
				listener,
				name,
				data,

			};

			if ( state.options.mute_in_log_event_name_arr.indexOf( log_item.name ) === -1 ) {

				if ( state.app.report_manager ) {

					state.app.report_manager.store_log_item( log_item );

				};

				if ( state.mode === "dev" ) {

					write_log_item( log_item );

				};

			};

		};

		// utility function to log an array of log_item

		fn.log_log_item_arr = function ( log_item_arr ) {

			// console.log( "log_item_arr", log_item_arr );

			for ( var i = 0; i < log_item_arr.length; i++ ) {

				var log_item = x.convert( log_item_arr[ i ], [
					[ "decode_json" ],
				]);

				// console.log( "log_item", log_item );

				write_log_item( log_item );

			};

		};

		// init

		fn.init = function ( app, options ) {

			state.app = app
			state.mode = app.config.mode;
			state.options = options || default_options;

		};

		return fn;

	};

	window[ window.webextension_library_name ].modules.report_manager_hub = function () {

		var x = window[ window.webextension_library_name ];

		var _state = {

			config: null,
			log_item_arr: [],

		};

		var _pub = {

			store_log_item ( data ) {

				_state.log_item_arr.push( data.log_item );

				if ( _state.log_item_arr.length > _state.config.report_config.max_log_item_arr_length ) {

					_state.log_item_arr.splice( 0, 20 );

				};

			},

			generate_webx_report ( data ) {

				var webx_report = {};

				webx_report.version = chrome.runtime.getManifest().version;
				webx_report.version_name = chrome.runtime.getManifest().version_name;

				webx_report.log_item_arr = _state.log_item_arr;

				return webx_report;

			},

			download_webx_report ( data ) {

				var webx_report = {};

				webx_report.version = chrome.runtime.getManifest().version;
				webx_report.version_name = chrome.runtime.getManifest().version_name;

				webx_report.log_item_arr = _state.log_item_arr;

				var json = x.util.encode_json( webx_report );
				var blob = new Blob([ json ]);
				var url = URL.createObjectURL( blob );

				window.open( url );
				x.util.download_file( data.report_name, url );

			},

			init: function ( app ) {

				_state.config = app.config;

			},

		};

		return _pub;

	};

	window[ window.webextension_library_name ].modules.report_manager = function () {

		var x = window[ window.webextension_library_name ];

		var _app = null;

		var _state = {

		};

		var _pub = {

			store_log_item: function ( log_item ) {

				if ( _state.config && _state.config.report_config && _state.config.report_config.active ) {

					log_item = x.convert( log_item, [
						[ "simplify", 5 ],
						[ "encode_json" ],
					]);

					_app.bg_api.exec( "report_manager_hub", "store_log_item", {

						log_item: log_item,

					});

				};

			},

			write_webx_report: function ( webx_report ) {

				_app.log.log_log_item_arr( webx_report.log_item_arr );

			},

			init: function ( app ) {

				_app = app;

				_state.config = app.config;

			},

		};

		return _pub;

	};

	window[ window.webextension_library_name ].modules.iframe_component_internal_manager = function () {

		var _state = {

			app: null,
			iframe_component_arr: []

		};

		var _priv = {

			add_observers: () => {

				window.addEventListener( "message", ( event ) => {

					if ( event.data && event.data.webx_id === _state.app.config.webx_id ) {

						_state.app.hub.fire( event.data.name, event.data.data );

					};

				});

			},

		};

		var _pub = {

			init: ( app ) => {

				_state.app = app;
				_priv.add_observers();

			},

			send_message: ( name, data ) => {

				window.top.postMessage({

					webx_id: _state.app.config.webx_id,
					window_name: window.name,

					name: name,
					data: data || {},

				}, "*" );

			},

		};

		return _pub;

	};

	window[ window.webextension_library_name ].modules.iframe_component_external_manager = function () {

		var _state = {

			app: null,
			initialized: false,
			iframe_component_arr: []

		};

		var _priv = {

			add_observers: () => {

				window.addEventListener( "message", ( event ) => {

					if ( event.data && event.data.webx_id === _state.app.config.webx_id ) {

						_state.iframe_component_arr.forEach( ( iframe_component ) => {

							if ( iframe_component.name === event.data.window_name ) {

								event.data.data.iframe_component = iframe_component;

								if ( event.data.name === "iframe_component_ready" ) {

									iframe_component.ready = true;
									iframe_component.content_window = event.source;

								};

								_state.app.hub.fire( event.data.name, event.data.data );

							};

						});

					};

				});

			},

			send_message: ( iframe_component, name, data ) => {

				if ( iframe_component.content_window && iframe_component.content_window.postMessage ) {

					iframe_component.content_window.postMessage({

						webx_id: _state.app.config.webx_id,
						name: name,
						data: data,

					}, "*" );

				} else {

					_state.app.log( "Could not send a message to the iframe" );

				};

			},

		};

		var _pub = {

			init: ( app ) => {

				if ( _state.initialized === false ) {

					_state.initialized = true;

					_state.app = app;

					_priv.add_observers();

				};

			},

			create_iframe_component_instance: ( name, url ) => {

				// initialize

					var iframe_component = {

						name: name,
						ready: false,

					};

					_state.iframe_component_arr.push( iframe_component );

					iframe_component.element = document.createElement( "iframe" );
					iframe_component.element.name = name;

				// add methods

					iframe_component.send_message = function ( event_name, data ) {

						_priv.send_message( iframe_component, event_name, data );

					};

				// assing src and return component object

					iframe_component.element.src = chrome.extension.getURL( url );

					return iframe_component;

			},

		};

		return _pub;			

	};

	window[ window.webextension_library_name ].modules.pure = function () {

		// define x

			var x = window[ window.webextension_library_name ];
			var _app = null;

		// vars

			var converters_hash = {};
			var options = {

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


		// public functions

			var _pub = {

				init: function ( app ) {

					_app = app;

				},

				set_options: function ( new_options ) {

					options = new_options;

				},

				register: function ( namespace, hash ) {

					converters_hash[ namespace ] = hash;

				},

				call: function ( namespace, from_name, to_name, input ) {

					if ( _app.config.mode === "dev" ) {

						var conv_data = conv_with_data( namespace, from_name, to_name, input );

						if ( options.silence && options.silence.indexOf( from_name + "_to_" + to_name ) === -1 ) {

							_app.log.log_conv_data( conv_data );

						};

						return conv_data.output;

					} else {

						return conv_no_data( namespace, from_name, to_name, input );

					};

				},

			};

		// return

			return _pub;

	};

	window[ window.webextension_library_name ].modules.bg_api = function () {

		if ( typeof chrome.extension === "undefined" ) {

			return;

		};

		var x = window[ window.webextension_library_name ];

		var api_hash = {};
		var _app = null;

		return {

			init: function ( app ) {

				_app = app;

				if ( chrome.extension.getBackgroundPage && chrome.extension.getBackgroundPage() === window ) {

					chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

						if ( message._target === "bg_api" ) {

							if ( api_hash[ message.api_name ] && api_hash[ message.api_name ][ message.method_name ] ) {

								var output = api_hash[ message.api_name ][ message.method_name ]( message.input, sender );

								if ( output instanceof Promise ) {

									output.then( callback );
									return true;

								} else {

									callback( output );

								};

							};

						};

					});

				};

			},

			register: function ( api_name, method_hash ) {

				api_hash[ api_name ] = method_hash;

			},

			exec: function ( api_name, method_name, input ) {

				if ( chrome.extension.getBackgroundPage && chrome.extension.getBackgroundPage() === window ) {

					return api_hash[ api_name ][ method_name ]( input );

				} else {

					return new Promise ( function ( resolve ) {

						try {

							chrome.runtime.sendMessage({

								_target: "bg_api",
								api_name: api_name,
								method_name: method_name,
								input: input

							}, function ( response ) {

								resolve( response );

							});

						} catch ( e ) {

							console( "error while sending bg message", e );

						};

					});

				};

			},

		};

	};

	window[ window.webextension_library_name ].modules.cache_manager = function () {

		// cache_item[ 0 ] - id
		// cache_item[ 1 ] - object
		// cache_item[ 2 ] - time of creation
		// cache_item[ 3 ] - store_forever_flag ( optional, overrides config.cache_max_age )

		var _state = {};
		var _app = null;

		var _priv = {

			init_cache: () => {

				return new Promise ( ( resolve ) => {

					chrome.storage.local.get([ "cache" ], ( storage_items ) => {

						if ( storage_items[ "cache" ] ) { // remove old items from cache if cache exists

							var current_ts = Date.now();
							var max_age = _state.app.config.cache_max_age * 60 * 60 * 1000;
							var cache_item_arr = storage_items[ "cache" ];

							for ( var i = cache_item_arr.length; i--; ) {

								if ( cache_item_arr[ i ][ 3 ] === true ) {

									//

								} else {

									if ( current_ts - cache_item_arr[ i ][ 2 ] > max_age ) {

										cache_item_arr.splice( i, 1 );

									};

								};

							};

							chrome.storage.local.set({ cache: cache_item_arr }, () => {

								resolve();

							});

						} else { // crate cache if it has not been created yet

							storage_items[ "cache" ] = [];

							chrome.storage.local.set( storage_items, () => {

								resolve();

							});

						};

					});

				});

			}

		};

		var _pub = {

			init: ( app ) => {

				_app = app;
				_state.app = app;

				_priv.init_cache()
				.then( () => {

					_state.app.hub.fire( "cache_manager_ready" );

				});

			},

			set: ( id, obj, store_forever_flag ) => {

				return new Promise ( ( resolve ) => {

					chrome.storage.local.get([ "cache" ], ( storage_items ) => {

						var cache_item_arr = storage_items[ "cache" ];
						var current_cache_item_index = null;
						var current_ts = Date.now();

						for ( var i = cache_item_arr.length; i--; ) {

							if ( cache_item_arr[ i ][ 0 ] === id ) {

								current_cache_item_index = i;
								break;

							};

						};

						if ( current_cache_item_index !== null ) {

							cache_item_arr.splice( current_cache_item_index, 1 );

						};

						cache_item_arr.push([ id, obj, current_ts, store_forever_flag ]);

						chrome.storage.local.set({ cache: cache_item_arr }, () => {

							resolve( obj );

						});

					});

				});

			},

			get: ( id ) => {

				return new Promise ( ( resolve ) => {

					chrome.storage.local.get([ "cache" ], ( storage_items ) => {

						var cache_item_arr = storage_items[ "cache" ];
						var cache_item_obj = null;

						for ( var i = cache_item_arr.length; i--; ) {

							if ( cache_item_arr[ i ][ 0 ] === id ) {

								cache_item_obj = cache_item_arr[ i ][ 1 ];
								break;

							};

						};

						resolve( cache_item_obj );

					});

				});

			},

		};

		return _pub;

	};

	window[ window.webextension_library_name ].modules.test_page_manager = function () {

		var _state = {};

		var _priv = {

			add_observers: () => {

				$( document ).on( "click", "#webx_test_page #update_button", () => {

					var event_info = _state.app.x.convert( document, [
						[ "query_selector", "#event_info" ],
						[ "object_property", "innerHTML" ],
						[ "decode_json" ],
					]);

					_state.app.hub.fire( event_info.name, event_info.data );

				});

			},

		};

		var _pub = {

			ready: false,

			init: ( app ) => {

				_state.app = app;

				_priv.add_observers();

			},

		};

		return _pub;

	};

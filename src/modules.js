
	window[ window.webextension_library_name ].modules.chrome = function ( app ) {

		function callback_handler ( path, resolve, response ) {

			if ( chrome.runtime.lastError ) {

				app.log.write( "runtime_last_error", path, chrome.runtime.lastError );

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
						[ "simplify", 10 ]
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

					_state.app.log.write( "Could not send a message to the iframe" );

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

							console.log( "error while sending bg message", e );

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

			clear: () => {

				return new Promise ( ( resolve ) => {

					chrome.storage.local.set( { cache: [] }, resolve );

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

	window[ window.webextension_library_name ].modules.log = function ( app, mode ) {

		var x = window[ window.webextension_library_name ];

		var state = {

			log_item_arr: [],

		};

		var default_options = {

			mute_in_log_event_name_arr: [],

		};

		state.app = app
		state.mode = mode;
		state.options = default_options;

		// write log item

		async function write_log_item ( log_item ) {

			if ( log_item.type === "normal" ) {

				var title = "%c " + log_item.app_name + " | " + log_item.arguments[ 0 ];

				console.groupCollapsed( title, "color: black" );

				for ( var i = 1; i < log_item.arguments.length; i ++ ) {

					console.log( log_item.arguments[ i ] );

				};

				console.groupEnd();

			} else if ( log_item.type === "conv_data" ) {

				var conv_data = log_item.conv_data;
				var title = "%c " + ( log_item.app_name || "app" ) + " | " + conv_data.namespace + ": " + conv_data.from_name + " => " + conv_data.to_name;

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

			} else if ( log_item.type === "exec_data" ) {

				var exec_data = log_item.exec_data;
				var title = "%c " + ( log_item.app_name || "app" ) + " | exec." + exec_data.module_name + "." + exec_data.method_name;

				if ( exec_data.error ) {

					console.group( title, "color: red" );
					console.log(exec_data.arguments);
					console.log(exec_data.stack);

				} else if (!exec_data.found) {

					console.group( title, "color: #F0AD4E" );
					console.log(exec_data.arguments);

				} else {

					console.group( title, "color: #5D4037" );
					console.log(exec_data.arguments);
					console.log( exec_data.output );

				};

				exec_data.exec_data_arr.forEach( function ( exec_data ) {

					if ( exec_data.module_name === "log" && exec_data.method_name === "write_exec" ) {

						write_log_item({

							type: "normal",
							app_name: "app",
							arguments: exec_data.arguments,

						})

					} else {

						write_log_item({

							type: "exec_data",
							exec_data: exec_data,

						});

					};

				});

				console.groupEnd();

			} else if ( log_item.type === "event" ) {

				var title = "%c " + log_item.app_name + " | " + log_item.listener + " ( " + log_item.source + " )" + ": " + log_item.name;

				console.groupCollapsed( title, "color: blue" );
				console.log( log_item.data );
				console.groupEnd();

			};

		};

		var _pub = {

			write: function () { // log type = normal

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

			},

			write_exec: function () {

			},

			log_conv_data: function ( conv_data ) { // log type = conv_data

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

			},

			log_exec_data: function ( exec_data ) { // log type = exec_data

				var log_item = {

					type: "exec_data",
					app_name: exec_data.app_name,

					exec_data,

				};

				if ( state.mode === "dev" ) {

					write_log_item( log_item )

				};

			},

			force_log_exec_data: function ( exec_data ) { // log type = exec_data

				var log_item = {

					type: "exec_data",
					app_name: exec_data.app_name,

					exec_data,

				};

				write_log_item( log_item )

			},

			log_event: function ( source, listener, name, data ) { // log type = event

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

			},

			log_log_item_arr: function ( log_item_arr ) { // utility function to log an array of log_item

				// console.log( "log_item_arr", log_item_arr );

				for ( var i = 0; i < log_item_arr.length; i++ ) {

					// var log_item = x.convert( log_item_arr[ i ], [
					// 	[ "decode_json" ],
					// ]);

					// console.log( "log_item", log_item );

					write_log_item( log_item_arr[ i ] );

				};

			},

		};

		return _pub;

	};

	window[ window.webextension_library_name ].modules.storage_manager = function () {

		// data_info[ 0 ] - type
		// data_info[ 1 ] - id
		// data_info[ 2 ] - data
		// data_info[ 3 ] - timestamp of creation

		var _app = null;

		var _priv = {

			clean_up: () => {

				chrome.storage.local.get( null, ( storage ) => {

					var key_arr_to_remove = [];
					var now_ts = Date.now();

					Object.keys( storage ).forEach( ( key ) => {

						var data_info = storage[ key ];

						if ( !data_info ) { return; };

						for ( var i = _app.config.storage_manager.type_duration_data_arr.length; i--; ) {

							var type_duration_data = _app.config.storage_manager.type_duration_data_arr[ i ];

							if ( type_duration_data && data_info[ 0 ] === type_duration_data[ 0 ] && now_ts - data_info[ 3 ] > type_duration_data[ 1 ] ) {

								key_arr_to_remove.push( key );

							};

						};

					});

					chrome.storage.local.remove( key_arr_to_remove );

				});

			},

		};

		var _pub = {

			init: ( app ) => {

				_app = app;

				_priv.clean_up();

				setInterval( _priv.clean_up, 60 * 60 * 1000 );

			},

			set: ( type, id, data ) => {

				var storage_id = type + "_" + id;
				var new_storage = {};
				new_storage[ storage_id ] = [ type, id, data, Date.now() ];

				return new Promise( ( resolve ) => {

					chrome.storage.local.set( new_storage, resolve );

				});

			},

			get: ( type, id ) => {

				var storage_id = type + "_" + id;

				return new Promise ( ( resolve ) => {

					chrome.storage.local.get([ storage_id ], ( storage ) => {

						if ( storage[ storage_id ] ) {

							resolve( storage[ storage_id ][ 2 ] );

						} else {

							resolve( null );

						};

					});

				});

			},

			clear: () => {

				return new Promise ( ( resolve ) => {

					chrome.storage.local.set( { cache: [] }, resolve );

				});

			},

		};

		return _pub;

	};

	window[ window.webextension_library_name ].modules.query = function () {

		return {

			query: function ( rq ) {

				if ( typeof rq.method === "undefined" ) {

					var arr = rq[ 0 ];
					var obj = rq[ 1 ];
					var match_arr = [];

					for ( var i = arr.length; i--; ) {

						var match_flag = true;
						var keys = Object.keys( obj );

						for ( var j = keys.length; j--; ) {

							var key = keys[ j ];

							if ( obj[ key ] !== arr[ i ][ key ] ) {

								match_flag = false;

							};

						};

						if ( match_flag ) {

							match_arr.push( arr[ i ] );

						};

					};

					return match_arr;

				} else if ( rq.method === "remove" ) {

					for ( var i = rq.arr.length; i--; ) {

						var item = rq.arr[ i ];
						var match_bool = true;
						var q_key_arr = Object.keys( rq.q || {} );
						var nq_key_arr = Object.keys( rq.nq || {} );
						
						for ( var j = q_key_arr.length; j--; ) {

							if ( item[ q_key_arr[ j ] ] !== rq.q[ q_key_arr[ j ] ] ) {

								match_bool = false;

							};

						};
						
						for ( var j = nq_key_arr.length; j--; ) {

							if ( item[ nq_key_arr[ j ] ] === rq.q[ nq_key_arr[ j ] ] ) {

								match_bool = false;

							};

						};

						if ( match_bool === true ) {

							rq.arr.splice( i, 1 );

						};

					};

				} else if ( rq.method === "find" ) {

					var match_arr = [];

					for ( var i = rq.arr.length; i--; ) {

						var item = rq.arr[ i ];
						var match_bool = true;
						var q_key_arr = Object.keys( rq.q || {} );
						var nq_key_arr = Object.keys( rq.nq || {} );
						
						for ( var j = q_key_arr.length; j--; ) {

							if ( item[ q_key_arr[ j ] ] !== rq.q[ q_key_arr[ j ] ] ) {

								match_bool = false;

							};

						};
						
						for ( var j = nq_key_arr.length; j--; ) {

							if ( item[ nq_key_arr[ j ] ] === rq.q[ nq_key_arr[ j ] ] ) {

								match_bool = false;

							};

						};

						if ( match_bool === true ) {

							match_arr.push( rq.arr[ i ] );
							
						};
					
					};

					return match_arr;

				};

			},

			simple_first_match: function ( arr, property_name, property_value ) {

			},

		};

	};

	window[ window.webextension_library_name ].modules.injected_script_manager = function () {

		var _state = {

			expression_index: 0,

		};

		var _pub = {

			init: async ( app ) => {

			},

			get_expression_value: ( expression ) => {

				_state.expression_index += 1;

				return new Promise( ( resolve ) => {

					var expression_index = _state.expression_index;

					var timeout = setTimeout( () => {

						clearTimeout( timeout );
						document.removeEventListener( "webx_expression_value_available", listener );

						resolve( null );

					}, 2 * 1000 );

					var listener = ( event ) => {

						if ( event.detail && event.detail && event.detail.expression_index === expression_index ) {

							clearTimeout( timeout );
							document.removeEventListener( "webx_expression_value_available", listener );

							resolve( event.detail.expression_value );

						};

					};

					document.addEventListener( "webx_expression_value_available", listener );

					$( document.body ).append( `

						<script>

							( function () {

								var expression_index = ${ expression_index };

								try {

									var expression_value = ${ expression };

								} catch ( e ) {

									var expression_value = null;

								};

								var event = new CustomEvent( 'webx_expression_value_available', {

									detail: {

										expression_value: expression_value,
										expression_index: expression_index,

									},

								});

								document.dispatchEvent( event );

							} () );

						</script>

					` );

				});

			},

		};

		return _pub;

	};
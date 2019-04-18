
	window[ window.webextension_library_name ].hub = function ( mode, options ) {

		var x = window[ window.webextension_library_name ];

		var state = {};
		var events = {};
		var complex_events = {};
		var default_options = {

			mute_in_log_event_name_arr: [],

		};

		state.mode = mode;
		state.options = options || default_options;

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

			fire: function ( name, data ) {

				if ( typeof events[ name ] !== 'undefined' ) {

					data = data ? data : {};
					data.event_name = name;

					events[ name ].forEach( function ( observer ) {

						x.log.log_event( "hub", "listener", name, data );
						observer( data );

					});

				};

				if ( typeof complex_events[ name ] !== 'undefined' ) {

					data = data ? data : {};
					data.event_name = name;

					complex_events[ name ].forEach( function ( observer ) {

						x.log.log_event( "hub", observer.observers_name, name, data );
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

								x.log.log_event( "window", context + " " + sender, name, data );
								observers[ "all" ]( data, event );

							};

							if ( observers[ name ] ) {

								x.log.log_event( "window", context + " " + sender, name, data );
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

							x.log.log_event( "runtime", observers_name, name, data );
							observers[ "all" ]( data, sender, callback );

						};

						if ( observers[ name ] ) {

							x.log.log_event( "runtime", observers_name, name, data );
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

		};

	};

	window[ window.webextension_library_name ].log = ( function () {

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

				}

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

			x.report_manager.store_log_item( log_item ); 

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

			x.report_manager.store_log_item( log_item );

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

				x.report_manager.store_log_item( log_item );

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

	} () );

	window[ window.webextension_library_name ].report_manager_hub = ( function () {

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

			init: function ( config ) {

				_state.config = config;

				x.bg_api.register( "report_manager_hub", _pub );

			},

		};

		return _pub;

	} () );

	window[ window.webextension_library_name ].report_manager = ( function () {

		var x = window[ window.webextension_library_name ];

		var _state = {

		};

		var _pub = {

			store_log_item: function ( log_item ) {

				if ( _state.config && _state.config.report_config && _state.config.report_config.active ) {

					log_item = x.convert( log_item, [
						[ "simplify" ],
						[ "encode_json" ],
					]);

					x.bg_api.exec( "report_manager_hub", "store_log_item", {

						log_item: log_item,

					});

				};

			},

			write_webx_report: function ( webx_report ) {

				x.log.log_log_item_arr( webx_report.log_item_arr );

			},

			init: function ( config ) {

				_state.config = config;

			},

		};

		return _pub;

	} () );
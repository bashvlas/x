
	window[ window.webextension_library_name ].hub = function ( mode ) {
		
		var events = {};
		var complex_events = {};

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

		function log_event ( source, listener, name, data ) {

			if ( mode === "prod" ) {

				// don't log events in production

			} else if ( mode === "dev" ) {

				var title = "%c " + listener + " ( " + source + " )" + ": " + name;

				console.groupCollapsed( title, "color: blue" );
				console.log( data );
				console.groupEnd();

			};

		};

		return {

			fire: function ( name, data ) {
				
				if ( typeof events[ name ] !== 'undefined' ) {

					data = data ? data : {};
					data.event_name = name;

					events[ name ].forEach( function ( observer ) {

						log_event( "hub", "listener", name, data );
						observer( data );
					
					});
				
				};
				
				if ( typeof complex_events[ name ] !== 'undefined' ) {

					data = data ? data : {};
					data.event_name = name;
					
					complex_events[ name ].forEach( function ( observer ) {

						log_event( "hub", observer.observers_name, name, data );
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

								log_event( "window", context + " " + sender, name, data );
								observers[ "all" ]( data, event );

							};

							if ( observers[ name ] ) {

								log_event( "window", context + " " + sender, name, data );
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

							log_event( "runtime", observers_name, name, data );
							observers[ "all" ]( data, sender, callback );

						};

						if ( observers[ name ] ) {

							log_event( "runtime", observers_name, name, data );
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

				if ( mode === "dev" ) {

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

						if ( mode === "dev" ) {

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

			}

		};

	};

	window[ window.webextension_library_name ].log = function ( mode ) {

		var state = {};

		state.mode = mode;		

		return function ( text ) {

			if ( state.mode === "dev" ) {

				console.log( text );

			};

		};

	};
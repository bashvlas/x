
	window[ window.webextension_library_name ].hub = function () {
		
		var events = {};

		function add_one ( name, observer ) {
		
			if ( typeof events[ name ] === 'undefined' ) {
			
				events[ name ] = [];

			}
			
			events[ name ].push( observer );
		
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
					
						observer( data );
					
					});
				
				};

			},

			add: function ( observers ) {
		
				Object.keys( observers ).forEach( function ( name ) {

					add_one( name, observers[ name ] );

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

								observers[ "all" ]( data, event );

							};

							if ( observers[ name ] ) {

								observers[ name ]( data, event );

							};

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

		};

	};
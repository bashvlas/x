
	window.x.hub = ( function () {
		
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

			trigger: function ( name, data ) {
				
				if ( typeof events[ name ] !== 'undefined' ) {

					data = data ? data : {};
					data.event_name = name;
					
					events[ name ].forEach( function ( observer ) {
					
						observer( data );
					
					});
				
				};

			},

			listen: function ( observers ) {
		
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

		};

	} () );

	window.x.hub = ( function () {

		return {

			send: function () {


			},

			listen: function () {


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
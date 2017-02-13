	
	function ( req, conv ) {

		if ( req.all_tabs_flag ) {

			conv.lib.window.chrome.tabs.query( {}, function ( tab_arr ) {

				tab_arr.forEach( function ( tab ) {

					conv.lib.window.chrome.tabs.sendMessage( tab.id, req );
					
				});
				
			});

		} else {

			return new Promise( function ( resolve ) {

				conv.lib.window.chrome.tabs.sendMessage( req.tab_id, req, resolve );
				
			});		

		};

	};
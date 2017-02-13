	
	function ( req, conv ) {

		conv.lib.window.chrome.tabs.onRemoved.addListener( function ( tab_id ) {

			conv( "edata", "chr", {
				
				event_name: "tab_removed",
				tab_id: tab_id,
				
			});

		});

	};
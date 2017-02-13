	
	function ( req, conv ) {

		conv.lib.window.chrome.tabs.onCreated.addListener( function ( tab ) {

			conv( "edata", "chr", {
				
				event_name: "tab_created",
				tab: tab,
				
			});

		});

	};
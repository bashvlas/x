	
	function ( req, conv ) {

		conv.lib.window.chrome.tabs.onUpdated.addListener( function ( tab_id, info, tab ) {

			conv( "edata", "chr", {

				event_name: "tab_updated",
				tab: tab,
				info: info,

			});

		});

	};
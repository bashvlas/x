	
	function ( req, conv ) {

		conv.lib.window.chrome.browserAction.onClicked.addListener( function ( tab ) {

			conv( "edata", "chr", {

				event_name: "ba_clicked",
				tab: tab,

			});

		});

	};
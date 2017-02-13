
	function ( req, conv ) {

		conv.lib.window.chrome.runtime.onInstalled.addListener( function ( details ) {
			
			if ( details.reason === "install" ) {
				
				conv( "edata", "chr", {

					event_name: "install",

				});

			} else if ( details.reason === "update" ) {
				
				conv( "edata", "chr", {

					event_name: "update",
					old_version: details.previousVersion,
					new_version: conv.lib.window.chrome.runtime.getManifest().version,

				});
			
			};
	
		});

	};
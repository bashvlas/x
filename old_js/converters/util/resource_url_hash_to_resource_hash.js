	
	function ( hash, conv ) {

		// extendd each url with chrome extension id and convert url hash to promise hash

			Object.keys( hash ).forEach( function ( key ) {

				hash[ key ] = conv.lib.window.chrome.extension.getURL( hash[ key ] );
				hash[ key ] = conv( "http_rq", "rs", {

					url: hash[ key ],
					method: "GET",

				})
				.then( function ( res ) {

					return res.body.text;

				});

			});

		//

		// convert promise hash to resource hash

			return conv( "promise_hash", "value_hash", hash );

		//

	};
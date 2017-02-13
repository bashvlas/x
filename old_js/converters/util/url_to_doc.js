	
	function ( url, conv ) {

		return conv( "http_rq", "rs", {
			url: url,
			method: "GET",
		})
		.then( function ( res ) {

			if ( res.head.error ) {

				return undefined;

			} else {

				return conv( "text", "doc", res.body.text );
				
			};

		});

	};
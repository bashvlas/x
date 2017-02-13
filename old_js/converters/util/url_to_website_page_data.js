	
	function ( url, conv ) {

		return conv( "http_rq", "rs", {
			url: url,
			method: "GET",
		})
		.then( function ( res ) {

			if ( res.head.error ) {

				return null;

			} else {

				return {

					url: url,
					html: res.body.text,

				};
				
			};

		});

	};
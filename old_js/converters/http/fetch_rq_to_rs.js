
	function ( rq, conv ) {

		var headers = new Headers( rq.headers || {} );

		if ( rq.method === "get_json" ) {

			return conv.lib.window.fetch( rq.url, {

				method: "GET",
				credentials: "include",
				headers: headers,

			})
			.then( function ( r ) {

				return r.text()
				.then( function ( text ) {

					return conv( "text", "json", text );

				});

			})
			.catch( function ( response ) {

				return null;

			});

		} else if ( rq.method === "get_doc" ) {

			return conv.lib.window.fetch( rq.url, {

				method: "GET",
				credentials: "include",
				headers: headers,

			})
			.then( function ( r ) {

				return r.text()
				.then( function ( text ) {

					return conv( "text", "doc", text );

				});

			})
			.catch( function ( response ) {

				return null;
				
			});

		} else if ( rq.method === "get_blob" ) {

			return conv.lib.window.fetch( rq.url, {

				method: "GET",
				credentials: "include",
				headers: headers,

			})
			.then( function ( r ) {

				return r.blob()

			})
			.catch( function ( response ) {

				return null;
				
			});

		} else if ( rq.method === "get_text" ) {

			return conv.lib.window.fetch( rq.url, {

				method: "GET",
				credentials: "include",
				headers: headers,

			})
			.then( function ( r ) {

				return r.text()

			})
			.catch( function ( response ) {

				return null;
				
			});

		} else if ( rq.method === "post_json_get_json" ) {

			headers.append( "Content-Type", "application/json" );

			return conv.lib.window.fetch( rq.url, {

				method: "POST",
				credentials: "include",
				body: JSON.stringify( rq.body ),
				headers: headers,

			})
			.then( function ( r ) {

				return r.text()
				.then( function ( text ) {

					return conv( "text", "json", text );

				});

			})
			.catch( function ( response ) {

				return null;

			});	

		};

	};
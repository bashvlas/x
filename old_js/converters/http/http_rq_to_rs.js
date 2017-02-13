
	function ( request, conv ) {

		var body;

		if ( request.method === "POST" && request.content_type === "application/x-www-form-urlencoded" ) {

			body = conv( "obj", "form_data", request.body );

		} else if ( request.method === "POST" && request.content_type === "application/json" ) {

			body = JSON.stringify( request.body );

		};

		return conv.lib.window.fetch( request.url, {
			method: request.method,
			credentials: "include",
			headers: new Headers({
				"Content-Type": request.content_type,
				"Accept": request.accept,
			}),
			body: body,
		})
		.then( function ( r ) {

			return r.text()
			.then( function ( text ) {

				return {
					head: {
						error: false,
						code: 0,
						http_req: request,
						status: r.status,
						headers: r.headers,
					},
					body: {
						text: text,
					},
				};

			});

		})
		.catch( function ( response ) {

			return {
				head: {
					error: true,
					code: 1,
					http_req: request,
				},
			};

		});

	};
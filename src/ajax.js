
	window.x.ajax = ( function () {

		function open_window_with_post_data ( url, data ) {

			var form = document.createElement( "form" );
			var input = document.createElement( "input" );

			form.action = url;
			form.method = "POST";
			form.target = "_blank";

			input.name = 'data';
			input.value = JSON.stringify( data );

			form.appendChild( input );
			form.style.display = "none";

			document.body.appendChild( form );
			
			form.submit();

		};
		
		function obj_to_form_data ( obj ) {

			return Object.keys( obj ).map( function ( name ) {

				return encodeURIComponent( name ) + "=" + encodeURIComponent( obj[ name ] );

			}).join( "&" );

		};

		function ajax ( rq ) {

			var headers = new Headers( rq.headers || {} );

			if ( rq.method === "get_json" ) {

				return window.fetch( rq.url, {

					method: "GET",
					credentials: "include",
					headers: headers,

				})
				.then( function ( r ) {

					return r.text()
					.then( function ( text ) {

						return x.util.text_to_json( text );

					});

				})
				.catch( function ( response ) {

					return null;

				});

			} else if ( rq.method === "get_doc" ) {

				return window.fetch( rq.url, {

					method: "GET",
					credentials: "include",
					headers: headers,

				})
				.then( function ( r ) {

					return r.text()
					.then( function ( text ) {

						return x.util.text_to_doc( text );

					});

				})
				.catch( function ( response ) {

					return null;
					
				});

			} else if ( rq.method === "get_blob" ) {

				return window.fetch( rq.url, {

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

				return window.fetch( rq.url, {

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

				return window.fetch( rq.url, {

					method: "POST",
					credentials: "include",
					body: JSON.stringify( rq.body ),
					headers: headers,

				})
				.then( function ( r ) {

					return r.text()
					.then( function ( text ) {

						return x.util.text_to_json( text );

					});

				})
				.catch( function ( response ) {

					return null;

				});

			} else if ( rq.method === "post" ) {

				headers.append( "Content-Type", "application/x-www-form-urlencoded" );

				return window.fetch( rq.url, {

					method: "POST",
					credentials: "include",
					body: obj_to_form_data( rq.body ),
					headers: headers,

				})
				.then( function ( r ) {

					return r.text()
					.then( function ( text ) {

						return x.util.text_to_json( text );

					});

				})
				.catch( function ( response ) {

					return null;

				});

			};

		};

		return ajax;

	} () );
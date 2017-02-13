
	function ( rq, conv ) {

		return new Promise( function ( resolve ) {

			// define event listeners

				function readystatechange_listener () {

					if ( this.readyState === 4 ) {

						if ( this.status === 200 ) {

							resolve({

								error: false,
								response: this.response,

							});

						} else {

							resolve({

								error: true,
								response: this.response,

							});

						};

					};

				};

				function timeout_listener () {

				};

				function load_listener () {

					if ( this.status === 200 ) {

						resolve({

							error: false,
							response: this.response,

						});

					} else {

						resolve({

							error: true,

						});
						
					}

				};

				function error_listener () {

					resolve({

						error: true,

					});

				};

			// init

				var xhr = new XMLHttpRequest();
				xhr.open( rq.method, rq.url, true );

			// set timeout

				if ( rq.timeout ) {

					xhr.timeout = rq.timeout;

				};

			// set response type

				xhr.responseType = rq.response_type || "text";

			// set headers

				if ( rq.headers ) {

					Object.keys( rq.headers ).forEach( function ( key ) { xhr.setRequestHeader( key, rq.headers[ key ] ) } );

				};

				if ( rq.rq_body_type === "json" ) {

					xhr.setRequestHeader( "Content-Type", "application/json" );

				};

			// register listeners

				xhr.addEventListener( "load", load_listener );
				xhr.addEventListener( "error", error_listener );
				xhr.addEventListener( "timeout", timeout_listener );
				// xhr.addEventListener( "readystatechange", readystatechange_listener );

			// define request body

				if ( rq.rq_body_type === "json" ) {

					var rq_body = JSON.stringify( rq.rq_body );
					
				} else if ( rq.rq_body_type === "form_data" ) {

					var rq_body = new FormData();

					Object.keys( rq.rq_body ).forEach( function ( key ) {

						rq_body.append( key, rq.rq_body[ key ] );

					});

				} else {

					var rq_body = null;

				};

			// send

				xhr.send( rq_body );

		});

	};
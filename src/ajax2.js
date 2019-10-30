
	window[ window.webextension_library_name ].ajax2 = ( function () {

		var x = window[ window.webextension_library_name ];

		function ajax ( rq ) {

			return new Promise( function ( resolve ) {

				// define event listeners

					function readystatechange_listener () {

						if ( this.readyState === 4 ) {

							if ( 200 <= this.status && this.status < 300 ) {

								resolve({

									meta: {

										success: true,
										error: false,
										status: this.status,

									},
									data: this.response

								});

							} else {

								resolve({

									meta: {

										success: false,
										error: true,
										status: this.status,
										
									},
									data: this.response,

								});

							};

						};

					};

					function timeout_listener () {

						resolve({

							meta: {

								error: true,
								
							},
							data: null,

						});

					};

					function load_listener () {

						if ( 200 <= this.status && this.status < 300 ) {

							resolve({

								meta: {

									success: true,
									error: false,
									status: this.status,

								},
								data: this.response,

							});

						} else {

							resolve({

								meta: {

									success: false,
									error: true,
									status: this.status,

								},
								data: this.response,

							});

						}

					};

					function error_listener () {

						resolve({

							meta: {

								success: false,
								error: true,
								status: this.status,

							},
							data: this.response,

						});

					};

				// create payload

					if ( rq.payload ) {

						if ( rq.payload.type === "query_string" ) {

							var query_string = "";

							Object.keys( rq.payload.data ).forEach( ( key, index ) => {

								if ( index > 0 ) {

									query_string += "&";

								};

								query_string += key + "=" + encodeURIComponent( rq.payload.data[ key ] );

							});

							if ( query_string ) {

								rq.url += "?" + query_string;
								
							};

						};

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

		return ajax;

	} () );

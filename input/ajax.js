
	window.x.ajax = ( function () {

		return {

			fetch: function ( rq ) {

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

				};

			},

			http: function ( request ) {

				var body;

				if ( request.method === "POST" && request.content_type === "application/x-www-form-urlencoded" ) {

					body = x.ajax.obj_to_form_data( request.body );

				} else if ( request.method === "POST" && request.content_type === "application/json" ) {

					body = JSON.stringify( request.body );

				};

				return window.fetch( request.url, {
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

			},

			obj_to_form_data: function ( obj ) {

				return Object.keys( obj ).map( function ( name ) {

					return encodeURIComponent( name ) + "=" + encodeURIComponent( obj[ name ] );

				}).join( "&" );

			},

			xhr: function ( rq ) {

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

			},

		};

	} () );
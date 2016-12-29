// 1.0.0

;( function () {

	function X ( window ) {

		var x = {};

		x.detector = {

			detect: function ( options ) {

				if ( options.type = "default" ) {

					var selector = options.selector;
					var callback = options.callback;
					var element_arr = window.document.querySelectorAll( selector );

					for ( var i = 0; i < element_arr.length; i++ ) {

						if ( element_arr[ 0 ].dataset.detected !== "1" ) {

							element_arr[ 0 ].dataset.detected = "1";
							callback( element_arr[ 0 ] );
							
						};

					};

					var observer = new MutationObserver( function ( records ) {
					
						var element_arr = window.document.querySelectorAll( selector );

						if ( element_arr ) {

							for ( var i = 0; i < element_arr.length; i++ ) {

								if ( element_arr[ i ].dataset.detected !== "1" ) {

									element_arr[ i ].dataset.detected = "1";
									callback( element_arr[ i ] );
									
								};
								
							};

						};

					});

					observer.observe( window.document, { childList: true, subtree: true } );

				} else if ( options.type = "one_time_promise" ) {

					return new Promise( function ( resolve ) {

						var element = window.document.querySelector( options.selector );

						if ( element ) {

							resolve( element );

						} else {

							var observer = new MutationObserver( function () {
						
								var element = window.document.querySelector( selector );

								if ( element ) {

									resolve( element );
									observer.disconnect( window.document );

								};

							})

							observer.observe( window.document, { childList: true, subtree: true } );

						};

					});

				};

			},

		};

		x.storage = {

			get: function ( path ) {

				var path_arr = path.split( "." );
				var current_object;

				return new Promise ( function ( resolve ) {

					window.chrome.storage.local.get( null, function ( items ) {

						current_object = items;

						for ( var i = 0; i < path_arr.length; i++ ) {

							if ( typeof current_object[ path_arr[ i ] ] !== undefined ) {

								current_object = current_object[ path_arr[ i ] ];
								
							} else {

								resolve( undefined );
								break;

							};

						};

						resolve( current_object );

					});

				});

			},

			set: function ( path, value ) {

				var path_arr = path.split( "." );
				var current_object;
				var success;

				return new Promise ( function ( resolve ) {

					window.chrome.storage.local.get( null, function ( items ) {

						current_object = items;

						for ( var i = 0; i < path_arr.length; i++ ) {

							if ( i === path_arr.length - 1 ) {

								current_object[ path_arr[ i ] ] = value;

							} else if ( typeof current_object[ path_arr[ i ] ] !== undefined ) {

								current_object = current_object[ path_arr[ i ] ];
								
							} else {

								resolve( false );
								break;

							};

						};

						window.chrome.storage.local.set( items, resolve.bind( this, true ) );

					});

				});

			},

		};

		x.hub = {

			send: function () {


			},

			listen: function () {


			},

			send_runtime_message_rq_to_rs: function ( rq ) {
			
				window.chrome.runtime.sendMessage( rq );
			
			},
			
			send_tab_message_rq_to_rs: function ( req, conv ) {

				if ( req.all_tabs_flag ) {

					window.chrome.tabs.query( {}, function ( tab_arr ) {

						tab_arr.forEach( function ( tab ) {

							window.chrome.tabs.sendMessage( tab.id, req );
							
						});
						
					});

				} else {

					return new Promise( function ( resolve ) {

						window.chrome.tabs.sendMessage( req.tab_id, req, resolve );
						
					});		

				};

			},

		};

		x.util = {
			
			text_to_json: function ( text ) {
			
				try {
			
					return JSON.parse( text );
			
				} catch ( e ) {
			
					return
			
				};
			
			},

		};

		x.query = {

			query: function ( rq ) {

				if ( typeof rq.method === "undefined" ) {

					var arr = rq[ 0 ];
					var obj = rq[ 1 ];
					var match_arr = [];

					for ( var i = arr.length; i--; ) {

						var match_flag = true;
						var keys = Object.keys( obj );

						for ( var j = keys.length; j--; ) {

							var key = keys[ j ];

							if ( obj[ key ] !== arr[ i ][ key ] ) {

								match_flag = false;

							};

						};

						if ( match_flag ) {

							match_arr.push( arr[ i ] );

						};

					};

					return match_arr;

				} else if ( rq.method === "remove" ) {

					for ( var i = rq.arr.length; i--; ) {

						var item = rq.arr[ i ];
						var match_bool = true;
						var q_key_arr = Object.keys( rq.q || {} );
						var nq_key_arr = Object.keys( rq.nq || {} );
						
						for ( var j = q_key_arr.length; j--; ) {

							if ( item[ q_key_arr[ j ] ] !== rq.q[ q_key_arr[ j ] ] ) {

								match_bool = false;

							};

						};
						
						for ( var j = nq_key_arr.length; j--; ) {

							if ( item[ nq_key_arr[ j ] ] === rq.q[ nq_key_arr[ j ] ] ) {

								match_bool = false;

							};

						};

						if ( match_bool === true ) {

							rq.arr.splice( i, 1 );

						};

					};

				} else if ( rq.method === "find" ) {

					var match_arr = [];

					for ( var i = rq.arr.length; i--; ) {

						var item = rq.arr[ i ];
						var match_bool = true;
						var q_key_arr = Object.keys( rq.q || {} );
						var nq_key_arr = Object.keys( rq.nq || {} );
						
						for ( var j = q_key_arr.length; j--; ) {

							if ( item[ q_key_arr[ j ] ] !== rq.q[ q_key_arr[ j ] ] ) {

								match_bool = false;

							};

						};
						
						for ( var j = nq_key_arr.length; j--; ) {

							if ( item[ nq_key_arr[ j ] ] === rq.q[ nq_key_arr[ j ] ] ) {

								match_bool = false;

							};

						};

						if ( match_bool === true ) {

							match_arr.push( rq.arr[ i ] );
							
						};
					
					};

					return match_arr;

				};

			},

		},

		x.ajax = {

			fetch: function ( rq, conv ) {

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

							return conv( "text", "json", text );

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

							return conv( "text", "doc", text );

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

							return conv( "text", "json", text );

						});

					})
					.catch( function ( response ) {

						return null;

					});	

				};

			},

			http_rq_to_rs: function ( request, conv ) {

				var body;

				if ( request.method === "POST" && request.content_type === "application/x-www-form-urlencoded" ) {

					body = conv( "obj", "form_data", request.body );

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

			xhr_rq_to_rs: function ( rq, conv ) {

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

		x.events = {

			add_listener: function ( event_name, callback ) {


			},

		};

		return x;

	};

	( function ( window ) {

		window.x = new X( window );

	} ( window ) );

} () );
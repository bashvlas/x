
	( function ( global_name ) {

		window.webextension_library_name = global_name;
		window[ global_name ] = {};

	} ( "webextension_library" ) );
	window[ window.webextension_library_name ].util = ( function () {

		var parser = new DOMParser();
		var x = window[ window.webextension_library_name ];

		return {

			get_scrollbar_width () {

				var div = document.createElement('div');
				div.style.visibility = 'hidden';
				div.style.overflow = 'scroll';
				div.style.width = '50px';
				div.style.height = '50px';
				div.style.position = 'absolute';
				document.body.appendChild(div);
				var result = div.offsetWidth - div.clientWidth;
				div.parentNode.removeChild(div);
				return result;

			},

			decode_json: ( json ) => {

				try {

					return JSON.parse( json );

				} catch ( e ) {

					return null;

				};

			},

			encode_json: ( json ) => {

				try {

					return JSON.stringify( json );

				} catch ( e ) {

					return null;

				};

			},

			inject_scripts: function ( tab_id, script_src_arr, options ) {

				return new Promise( function ( resolve ) {

					var script_src = script_src_arr.splice( 0, 1 )[ 0 ];
					var all_frames = options ? !!options.all_frames : false;
					var frame_id = options ? options.frame_id || 0 : 0;

					chrome.tabs.executeScript( tab_id, {

						file: script_src,
						runAt: "document_start",
						allFrames: all_frames,
						frameId: frame_id,

					}, function () {

						if ( script_src_arr.length > 0 ) {

							x.util.inject_scripts( tab_id, script_src_arr, options )
							.then( resolve );

						} else {

							resolve();

						};

					});

				})

			},

			inject_styles: function ( tab_id, style_url_arr, options ) {

				var all_frames = options ? !!options.all_frames : false;
				var frame_id = options ? options.frame_id || 0 : 0;

				for ( var i = 0; i < style_url_arr.length; i++ ) {

					chrome.tabs.insertCSS( tab_id, {

						file: style_url_arr[ i ],
						runAt: "document_start",
						allFrames: all_frames,
						frameId: frame_id,

					});

				};

			},

			inject_script_arr: function ( document, script_arr, inject_into_body_flag ) {

				script_arr.forEach( function ( src ) {

					var script = document.createElement('script');
					script.src = src;
					script.async = false;

					if ( inject_into_body_flag ) {

						document.body.appendChild( script );

					} else {

						document.head.appendChild( script );

					};

				});

			},

			inject_style_arr: function ( document, style_arr, inject_into_body_flag ) {

				style_arr.forEach( function ( src ) {

					var link = document.createElement( 'link' );
					link.href = src;
					link.rel = "stylesheet";

					if ( inject_into_body_flag ) {

						document.body.appendChild( link );

					} else {

						document.head.appendChild( link );

					};

				});

			},

			open_new_tab: function ( url ) {

				chrome.tabs.create({ active: true, url: url });

			},

			send_to_all_tabs: function ( message ) {

				chrome.tabs.query( {}, function ( tab_arr ) {

					tab_arr.forEach( function ( tab ) {

						chrome.tabs.sendMessage( tab.id, message );

					});

				});

			},

			list_to_arr: function ( list ) {

				return Array.prototype.slice.call( list );

			},

			text_to_json: function ( text ) {

				try {

					return JSON.parse( text );

				} catch ( e ) {

					return undefined;

				};

			},

			text_to_doc: function ( text ) {

				return parser.parseFromString( text, "text/html" );

			},

			html_to_doc: function ( html ) {

				return parser.parseFromString( html, "text/html" );

			},

			doc_to_val: function ( rq ) {

				var doc = rq[ 0 ];
				var selector = rq[ 1 ];
				var val_type = rq[ 2 ];
				var detail = rq[ 3 ];
				var modifier_arr = rq[ 4 ];

				var output = null;

				if ( val_type === "jquery_html" ) {

					output = $( selector, doc ).html();

				} else if ( val_type === "length" ) {

					output = doc.querySelectorAll( selector ).length;

				} else {

					var element = doc.querySelector( selector );

					if ( element ) {

						if ( val_type === "text" ) {

							output = element.innerText;

						} else if ( val_type === "html" ) {

							output = element.innerHTML;

						} else if ( val_type === "attr" ) {

							output = element.getAttribute( detail );

						} else if ( val_type === "value" ) {

							output = element.value;

						} else {

							output = null;

						}

					} else {

						output = null;

					};

				};

				if ( modifier_arr ) {

					for ( var i = 0; i < modifier_arr.length; i++ ) {

						if ( modifier_arr[ i ] === "trim" ) {

							if ( typeof output === "string" && output.trim ) {

								output = output.trim();

							};

						} else if ( modifier_arr[ i ] === "bool" ) {

							output = !!output;

						} else if ( modifier_arr[ i ][ 0 ] === "match" && output && output.match ) {

							output = output.match( modifier_arr[ i ][ 1 ] );

						} else if ( modifier_arr[ i ][ 0 ] === "array_item" && output ) {

							output = output[ modifier_arr[ i ][ 1 ] ];

						} else if ( modifier_arr[ i ][ 0 ] === "replace" && output && output.replace ) {

							output = output.replace( modifier_arr[ i ][ 1 ], modifier_arr[ i ][ 2 ] );

						};

					};

				};

				return output;

			},

			is_defined: function ( item ) {

				if ( typeof item === "undefined" ) {

					return false;

				} else {

					return true;

				}

			},

			is_undefined: function ( item ) {

				if ( typeof item === "undefined" ) {

					return true;

				} else {

					return false;

				}

			},

			normalize_links: function ( element ) {

				var link_arr = element.querySelectorAll( "a" );

				for ( var i = link_arr.length; i--; ) {

					link_arr[ i ].href = link_arr[ i ].href;

				};

				return element;

			},

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

			extend: function ( obj_1, obj_2 ) {

				Object.keys( obj_2 ).forEach( function ( key ) {

					obj_1[ key ] = obj_2[ key ];

				});

				return obj_1;

			},

			filter: function ( obj ) {

				var keys = Object.keys( obj );

				for ( var i = keys.length; i--; ) {

					if ( !obj[ keys[ i ] ] ) {

						delete obj[ keys[ i ] ];

					};

				};

				return obj;

			},

			wait: function ( time ) {

				return new Promise( function ( resolve ) {

					setTimeout( resolve, time );

				});

			},

			cookie_to_hash: function ( cookie ) {

				var pair_arr = cookie.split( /;\s*/ )
				var cookie_hash = {};

				for ( var i = 0; i < pair_arr.length; i++ ) {

					pair_arr[ i ] = pair_arr[ i ].split( "=" );

					cookie_hash[ pair_arr[ i ] [ 0 ] ] = pair_arr[ i ][ 1 ];

				}

				return cookie_hash;

			},

			pad: function ( n ) {

				return ( n < 10 ) ? "0" + n : "" + n;

			},

			trigger: function ( element, event_name ) {

				if ( "createEvent" in document) {

					var event = document.createEvent( "HTMLEvents" );
					event.initEvent( event_name, false, true );
					element.dispatchEvent( event, { bubbles: true });

				} else {

					element.fireEvent( "on" + event_name );

				};

			},

			open_window_with_post_data: function ( url, data ) {

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

			},

			encode: function ( str ) {

				str.split( "" ).map( function ( s ) { return String.fromCharCode( s.charCodeAt( 0 ) ) } ).join( "" )

			},

			download_file: function ( name, url ) {

				var link = document.createElement( "a" );
				link.download = name;
				link.href = url;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				delete link;

			},

			load_resources: function ( resource_data_arr ) {

				return new Promise( function ( resolve ) {

					var resource_hash = {};
					var loaded_resource_amount = 0;

					resource_data_arr.forEach( function ( resource_data ) {

						var name = resource_data[ 0 ];
						var type = resource_data[ 1 ];
						var url = resource_data[ 2 ];

						if ( url.indexOf( "local" ) === 0 ) {

							url = chrome.extension.getURL( url.replace( "local", "" ) );

						};

						$.get( url, function ( response ) {

							loaded_resource_amount += 1;

							if ( type === "text" ) {

								resource_hash[ name ] = response;

							} else if ( type === "json" ) {

								resource_hash[ name ] = x.util.text_to_json( response );

							} else {

								resource_hash[ name ] = response;

							};

							if ( resource_data_arr.length === loaded_resource_amount ) {

								resolve( resource_hash );

							};

						}, "text" );

					});

				});

			},



		};

	} () );

	window[ window.webextension_library_name ].procedures = ( function () {

		var x = window[ window.webextension_library_name ];

		return {

			load_config: function () {

				return x.ajax({

					method: "get_json",
					url: chrome.extension.getURL( "/config.json" ),

				});

			},

			allow_iframes: function ( url_arr ) {

				chrome.webRequest.onHeadersReceived.addListener( function ( details ) {

					for ( var i = 0; i < details.responseHeaders.length; ++i ) {

						if ( details.responseHeaders[i].name.toLowerCase() === 'x-frame-options' ) {

							details.responseHeaders.splice( i, 1 );

						};

					};

					return { responseHeaders: details.responseHeaders };

				}, { urls: url_arr }, [ 'blocking', 'responseHeaders' ] );

			},

			clear_all_cookies: function ( url ) {

				chrome.cookies.getAll( { url: url }, function ( cookie_arr ) {

					cookie_arr.forEach( function ( cookie ) {

						chrome.cookies.remove({

							url: url,
							name: cookie.name,

						});

					});

				});

			}

		};

	} () );

	window[ window.webextension_library_name ].logs = ( function () {

		return {

			start_clearing_logs: function () {

			},

			save_log_item: function () {

				return new Promise( function ( resolve ) {

					chrome.storage.local

				});

			},

		};

	} () );

	window[ window.webextension_library_name ].url = ( function () {

		return {
		};

	} () );

	window[ window.webextension_library_name ].hub = function ( mode, options ) {

		var state = {};
		var events = {};
		var complex_events = {};
		var default_options = {

			mute_in_log_event_name_arr: [],

		};

		state.mode = mode;
		state.options = options || default_options;

		function add_one ( name, observer ) {

			if ( typeof events[ name ] === 'undefined' ) {

				events[ name ] = [];

			}

			events[ name ].push( observer );

		};

		function add_one_observer ( observers_name, name, observer ) {

			if ( typeof complex_events[ name ] === 'undefined' ) {

				complex_events[ name ] = [];

			}

			complex_events[ name ].push({

				observers_name: observers_name,
				observer_fn: observer,

			});

		};

		function remove ( name ) {

			events[ name ] = undefined;

		};

		function log_event ( source, listener, name, data ) {

			if ( state.mode === "prod" ) {

				// don't log events in production

			} else if ( state.mode === "dev" ) {

				if ( state.options.mute_in_log_event_name_arr.indexOf( name ) === -1 ) {

					var title = "%c " + listener + " ( " + source + " )" + ": " + name;

					console.groupCollapsed( title, "color: blue" );
					console.log( data );
					console.groupEnd();

				};

			};

		};

		return {

			fire: function ( name, data ) {

				if ( typeof events[ name ] !== 'undefined' ) {

					data = data ? data : {};
					data.event_name = name;

					events[ name ].forEach( function ( observer ) {

						log_event( "hub", "listener", name, data );
						observer( data );

					});

				};

				if ( typeof complex_events[ name ] !== 'undefined' ) {

					data = data ? data : {};
					data.event_name = name;

					complex_events[ name ].forEach( function ( observer ) {

						log_event( "hub", observer.observers_name, name, data );
						observer.observer_fn( data );

					});

				};

			},

			add: function ( observers ) {

				Object.keys( observers ).forEach( function ( name ) {

					add_one( name, observers[ name ] );

				});

			},

			add_observers: function ( observers_name, observers ) {

				Object.keys( observers ).forEach( function ( name ) {

					add_one_observer( observers_name, name, observers[ name ] );

				});

			},

			send_runtime_message_rq_to_rs: function ( rq ) {

				window.chrome.runtime.sendMessage( rq );

			},

			send_tab_message_rq_to_rs: function ( req ) {

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

			add_window_observers: function ( window, context, sender, observers ) {

				window.addEventListener( "message", function ( event ) {

					if ( event.data && event.data.context === context ) {

						var name = event.data.name;
						var data = event.data.data;

						if ( event.data.sender === sender ) {

							if ( observers[ "all" ] ) {

								log_event( "window", context + " " + sender, name, data );
								observers[ "all" ]( data, event );

							};

							if ( observers[ name ] ) {

								log_event( "window", context + " " + sender, name, data );
								observers[ name ]( data, event );

							};

						};

					};

				});

			},

			add_runtime_observers: function ( observers_name, observers ) {

				chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

					if ( message && message.name ) {

						var name = message.name;
						var data = message.data;

						if ( observers[ "all" ] ) {

							log_event( "runtime", observers_name, name, data );
							observers[ "all" ]( data, sender, callback );

						};

						if ( observers[ name ] ) {

							log_event( "runtime", observers_name, name, data );
							observers[ name ]( data, sender, callback );

						};

					};

				});

			},

			find_and_add_event_listeners: function ( element ) {

				var _this = this;

				$( element ).on( "click", "[data-onclick]", function ( event ) {

					_this.fire( event.currentTarget.dataset.onclick, event );

				});

			},

			message_window: function ( window, context, sender, name, data ) {

				window.postMessage({

					context: context,
					sender: sender,
					name: name,
					data: data,

				}, "*" );

			},

			send_to_active_tab: function ( name, data, callback ) {

				if ( state.mode === "dev" ) {

					var title = "%c " + "OUT" + ": " + name;

					console.groupCollapsed( title, "color: brown" );
					console.log( data );
					console.groupEnd();

				};

				chrome.tabs.query( { active: true, currentWindow: true }, function ( tab_arr ) {

					chrome.tabs.sendMessage( tab_arr[ 0 ].id, {

						name: name,
						data: data,

					}, function ( response ) {

						if ( state.mode === "dev" ) {

							var title = "%c " + "OUT RESPONSE" + ": " + name;

							console.groupCollapsed( title, "color: brown" );
							console.log( response );
							console.groupEnd();

						};

						if ( callback ) {

							callback( response );

						};

					});

				});

			},

			set_mode: ( mode ) => {

				state.mode = mode;

			},

		};

	};

	window[ window.webextension_library_name ].log = function ( mode ) {

		var state = {};

		state.mode = mode;

		var fn = function () {

			if ( state.mode === "dev" ) {

				console.log.apply( null, arguments );

			};

		};

		fn.set_mode = ( mode ) => {

			state.mode = mode;

		};

		return fn;

	};

	window[ window.webextension_library_name ].tester = ( function () {

		var x = window[ window.webextension_library_name ];

		return {

			test_conv: function ( conv_name, json_url ) {

				x.ajax({ method: "get_json", url: json_url })
				.then( function ( test_data ) {

					Object.keys( test_data ).forEach( function ( conv_fn_name ) {

						test_data[ conv_fn_name ].forEach( function ( test_data ) {

							var input_name = conv_fn_name.split( "_to_" )[ 0 ];
							var output_name = conv_fn_name.split( "_to_" )[ 1 ];

							Promise.all([

								x.tester.unserialize( test_data.input ),
								x.tester.unserialize( test_data.output )

							]).then( function ( io ) {

								var input = io[ 0 ];
								var output = io[ 1 ];

								var conv_data = x.conv.get_conv_data( conv_name, input_name, output_name, input );
								var equal_bool = x.tester.compare( output, conv_data.output );

								x.tester.log_test_case( conv_data, input, output, equal_bool );

							});

						});

					});

				});

			},

			unserialize: function ( data ) {

				return new Promise( function ( resolve ) {

					if ( data === null || typeof data !== "object" ) {

						resolve( data );

					} else if ( data.__serial_type__ === "element" ) {

						resolve( x.tester.html_to_element( data.html ) );

					} else if ( data.__serial_type__ === "date" ) {

						resolve( new Date( data.ts ) );

					} else if ( data.__serial_type__ === "page_data" ) {

						x.ajax({

							method: "get_text",
							url: "pages/" + encodeURIComponent( encodeURIComponent( data.url ) ),

						}).then( function ( text ) {

							resolve({

								url: data.url,
								text: text,
								doc: x.util.html_to_doc( text ),

							});

						});

					} else if ( data.__link_to_this_object__ ) {

						x.ajax({

							method: "get_json",
							url: data.__link_to_this_object__,

						}).then( function ( json ) {

							resolve( json );

						});

					} else {

						var total_key_count = Object.keys( data ).length;
						var unserialized_key_count = 0;

						Object.keys( data ).forEach( function ( key ) {

							x.tester.unserialize( data[ key ] )
							.then( function ( value ) {

								data[ key ] = value;

								unserialized_key_count += 1;

								if ( unserialized_key_count === total_key_count ) {

									resolve( data );

								};

							});

						});

						if ( Object.keys( data ).length === 0 ) {

							resolve( data );

						};

					};

				});

			},

			html_to_element: function ( html ) {

				var parser = new DOMParser;
				var dom = parser.parseFromString( html, 'text/html');

				return dom.body.firstElementChild;

			},

			compare: function ( obj_1, obj_2 ) {

				if ( obj_1 === obj_2 ) {

					return true;

				} else if ( obj_1 instanceof Date && obj_2 instanceof Date ) {

					return obj_1.getTime() === obj_2.getTime();

				} else if ( obj_1 === null && obj_2 === null ) {

					return true;

				} else if ( typeof obj_1 === "object" && typeof obj_2 === "object" && obj_1 !== null && obj_2 !== null ) {

					var key_arr_1 = Object.keys( obj_1 );
					var key_arr_2 = Object.keys( obj_2 );
					var equal;

					for ( var i = key_arr_1.length; i--; ) {

						equal = x.tester.compare( obj_1[ key_arr_1[ i ] ], obj_2[ key_arr_1[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					for ( var i = key_arr_2.length; i--; ) {

						equal = x.tester.compare( obj_1[ key_arr_2[ i ] ], obj_2[ key_arr_2[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					return true;

				} else {

					return false;

				};

			},

			log_test_case: function ( conv_data, input, output, equal_bool ) {

				var style = equal_bool ? "color:green" : "color:red";

				console.groupCollapsed( "%c " + conv_data.namespace + ": " + conv_data.from_name + " => " + conv_data.to_name, style );

				console.log( input );
				console.log( output );
				console.log( conv_data.output );

				x.conv.log_conv_data( conv_data );

				console.groupEnd();

			}

		};

	} () );

	window[ window.webextension_library_name ].ajax = ( function () {

		var x = window[ window.webextension_library_name ];

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

		function http ( request ) {

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

		};

		function xhr ( rq ) {

			return new Promise( function ( resolve ) {

				// define event listeners

					function readystatechange_listener () {

						if ( this.readyState === 4 ) {

							if ( this.status === 200 ) {

								resolve({

									error: false,
									status: this.status,
									response: this.response,

								});

							} else {

								resolve({

									error: true,
									status: this.status,
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
								status: this.status,
								response: this.response,

							});

						} else {

							resolve({

								status: this.status,
								error: true,

							});

						}

					};

					function error_listener () {

						resolve({

							status: this.status,
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

		function ajax ( rq ) {

			var headers = new Headers( rq.headers || {} );
			var credentials = rq.credentials || "include";

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
					credentials: credentials,
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
					credentials: credentials,
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
					credentials: credentials,
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
					credentials: credentials,
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
					credentials: credentials,
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

			} else if ( rq.method === "http" ) {

				return http( rq.data );

			} else if ( rq.method === "xhr" ) {

				return xhr( rq.data );

			};

		};

		return ajax;

	} () );

	window[ window.webextension_library_name ].ajax2 = ( function () {

		var x = window[ window.webextension_library_name ];

		function ajax ( rq ) {

			return new Promise( function ( resolve ) {

				// define event listeners

					function readystatechange_listener () {

						if ( this.readyState === 4 ) {

							if ( this.status === 200 ) {

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

						if ( this.status === 200 ) {

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

	window[ window.webextension_library_name ].query = ( function () {

		return {

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

		};

	} () );
	window[ window.webextension_library_name ].storage = ( function () {

		return {

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

	} () );
	window[ window.webextension_library_name ].detect = ( function () {

		var detector_counter = 0;

		function detect ( rq ) {

			// init

				var root_element = rq.root || rq.root_element || document;
				var target_element = rq.target_element || document;
				var callback = rq.callback;
				var method = rq.method || "normal";
				var selector = rq.selector || "*";
				var detector_id = detector_counter;

			// increase the counter

				detector_counter += 1;

			if ( method === "normal" ) {

				root_element = root_element || document;

				var element_arr = root_element.querySelectorAll( selector );

				for ( var i = 0; i < element_arr.length; i++ ) {

					if ( element_arr[ i ].dataset[ "detected_" + detector_id ] !== "1" ) {

						element_arr[ i ].dataset[ "detected_" + detector_id ] = "1";
						callback( element_arr[ i ] );

					};

				};

				var observer = new MutationObserver( function ( records ) {

					var element_arr = root_element.querySelectorAll( selector );

					if ( element_arr ) {

						for ( var i = 0; i < element_arr.length; i++ ) {

							if ( element_arr[ i ].dataset[ "detected_" + detector_id ] !== "1" ) {

								element_arr[ i ].dataset[ "detected_" + detector_id ] = "1";
								callback( element_arr[ i ] );

							};

						};

					};

				});

				observer.observe( root_element, { childList: true, subtree: true } );

			} else if ( method === "once" ) {

				return new Promise( function ( resolve ) {

					var element = root_element.querySelector( selector );

					if ( element ) {

						resolve( element );

					} else {

						var observer = new MutationObserver( function () {

							var element = root_element.querySelector( selector );

							if ( element ) {

								resolve( element );
								observer.disconnect( root_element );

							};

						})

						observer.observe( root_element, { childList: true, subtree: true } );

					};

				});

			} else if ( method === "wait_for" ) {

				return new Promise( function ( resolve ) {

					var resolved = false;
					var element = $( selector, root_element ).get( 0 );

					if ( element ) {

						resolve( element );

					} else {

						var observer = new MutationObserver( function () {

							if ( resolved === false ) {

								element = $( selector, root_element ).get( 0 );

								if ( element ) {

									resolve( element );
									observer.disconnect( root_element );
									resolved = true;

								};

							};

						});

						observer.observe( root_element, {

							childList: true,
							subtree: true,

						});

					};

				});

			} else if ( method === "detect_attribute_change" ) {

				var observer = new MutationObserver( function ( records ) {

					callback( target_element, records );

				});

				observer.observe( target_element, { attributes: true } );

			} else if ( method === "detect_changes" ) {

				var observer = new MutationObserver( function ( records ) {

					callback( target_element, records );

				});

				observer.observe( target_element, {

					attributes: true,
					childList: true,
					subtree: true,

				});

			} else if ( method === "detect_new_element" ) {

				var observer = new MutationObserver( function ( records ) {

					callback( target_element, records );

				});

				observer.observe( target_element, {

					attributes: true,
					childList: true,
					subtree: true,

				});

			};

		};

		return detect;

	} () );

	window[ window.webextension_library_name ].bg_api = ( function () {

		if ( typeof chrome.extension === "undefined" ) {

			return;

		};

		var api_hash = {};

		chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

			if ( message._target === "bg_api" ) {

				if ( api_hash[ message.api_name ] && api_hash[ message.api_name ][ message.method_name ] ) {

					var output = api_hash[ message.api_name ][ message.method_name ]( message.input, sender );

					if ( output instanceof Promise ) {

						output.then( callback );
						return true;

					} else {

						callback( output );

					};

				};

			};

		});

		return {

			register: function ( api_name, method_hash ) {

				api_hash[ api_name ] = method_hash;

			},

			exec: function ( api_name, method_name, input ) {

				return new Promise ( function ( resolve ) {

					chrome.runtime.sendMessage({

						_target: "bg_api",
						api_name: api_name,
						method_name: method_name,
						input: input

					}, resolve );

				});

			},

		};

	} () );
	window[ window.webextension_library_name ].conv = ( function () {

		// define x

			var x = window[ window.webextension_library_name ];

		// vars

			var converters_hash = {};
			var options = {

				mode: "prod",
				silence: [],

			};
			var conv_data_arr = [];

		// util functions

			var conv_with_data = ( function () {

				var conv = function( namespace, from_name, to_name, input ) {

					var conv_hash = converters_hash[ namespace ];
					var conv_name = from_name + "_to_" + to_name;
					var conv_data = {

						namespace: namespace,
						from_name: from_name,
						to_name: to_name,

						conv_data_arr: [],
						found: true,

						input: input,
						output: undefined,

					};

					function pseudo_conv ( namespace, from_name, to_name, input ) {

						var local_conv_data = conv( namespace, from_name, to_name, input );
						conv_data.conv_data_arr.push( local_conv_data );

						return local_conv_data.output;

					};

					if ( conv_hash[ conv_name ] ) {

						try {

							conv_data.output = conv_hash[ conv_name ]( input, pseudo_conv );

							if (conv_data.output instanceof Promise) {

								conv_data.output = new Promise( function ( resolve ) {

									conv_data.output
										.then(function(output) {

											resolve(output);

										})
										.catch(function(error) {

											conv_data.error = true;
											conv_data.stack = error.stack;

										});

								});

							};

						} catch ( error ) {

							conv_data.error = true;
							conv_data.stack = error.stack;

						};

					} else {

						conv_data.found = false;

					};

					return conv_data;

				};

				return conv;

			} () );

			var conv_no_data = ( function () {

				var conv = function ( namespace, from_name, to_name, input ) {

					var conv_hash = converters_hash[ namespace ];

					if ( conv_hash && conv_hash[ from_name + "_to_" + to_name] ) {

						try {

							var output = conv_hash[ from_name + "_to_" + to_name ]( input, conv );

							if (output instanceof Promise) {

								return new Promise( function( resolve, reject ) {

									output
										.then(function(output) {

											resolve(output);

										})
										.catch(function(error) {

											resolve(undefined);

										});

								});

							} else {

								return output;

							};

						} catch ( error ) {

							return undefined;

						};

					} else {

						return undefined;

					};

				};

				return conv;

			} () );

		// main function

			function conv ( namespace, from_name, to_name, input ) {

				if ( options.mode === "dev" ) {

					var conv_data = conv_with_data( namespace, from_name, to_name, input );

					if ( options.silence && options.silence.indexOf( from_name + "_to_" + to_name ) === -1 ) {

						x.conv.log_conv_data( conv_data );
						conv_data_arr.push( conv_data );

					};

					return conv_data.output;

				} else if ( options.mode === "prod" ) {

					return conv_no_data( namespace, from_name, to_name, input );

				};

				var fn = converters_hash[ namespace ][ from_name + "_to_" + to_name ];

				return fn( input, conv );

			};

		// helper public functions

			conv.register = function ( namespace, hash ) {

				converters_hash[ namespace ] = hash;

			};

			conv.set_options = function ( new_options ) {

				options = new_options;

			};

			conv.log_conv_data = function ( conv_data ) {

				var title = "%c " + conv_data.namespace + ": " + conv_data.from_name + " => " + conv_data.to_name;

				if ( conv_data.error ) {

					console.groupCollapsed( title, "color: red" );
					console.log(conv_data.input);
					console.log(conv_data.stack);

				} else if (!conv_data.found) {

					console.groupCollapsed( title, "color: #F0AD4E" );
					console.log(conv_data.input);

				} else {

					console.groupCollapsed( title, "color: green" );
					console.log(conv_data.input);
					console.log(conv_data.output);

				}

				conv_data.conv_data_arr.forEach( function ( conv_data ) {

					x.conv.log_conv_data( conv_data );

				});

				console.groupEnd();

			};

			conv.get_conv_data = conv_with_data;

			conv.flush = function () {

				conv_data_arr.forEach( conv.log_conv_data );

			};

		// return

			return conv;

	} () );

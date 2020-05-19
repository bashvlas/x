
	window[ window.webextension_library_name ].util = ( function () {

		var parser = new DOMParser();
		var x = window[ window.webextension_library_name ];

		return {

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

						equal = x.util.compare( obj_1[ key_arr_1[ i ] ], obj_2[ key_arr_1[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					for ( var i = key_arr_2.length; i--; ) {

						equal = x.util.compare( obj_1[ key_arr_2[ i ] ], obj_2[ key_arr_2[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					return true;

				} else {

					return false;

				};

			},

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

			get_active_tab: () => {

				return new Promise( ( resolve ) => {

					chrome.tabs.query({ active: true, currentWindow: true }, ( tabs ) => {

						resolve( tabs[ 0 ] );

					});

				});

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
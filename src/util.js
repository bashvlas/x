
	window.x.util = ( function () {

		var parser = new DOMParser();

		return {

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

				if ( val_type === "length" ) {

					return doc.querySelectorAll( selector ).length;

				} else {

					var element = doc.querySelector( selector );

					if ( element ) {

						if ( val_type === "text" ) {

							return element.innerText;

						} else if ( val_type === "html" ) {

							return element.innerHTML;

						} else if ( val_type === "attr" ) {

							return element.getAttribute( detail );

						} else if ( val_type === "value" ) {

							return element.value;

						} else {

							return null;

						}

					} else {

						return null;

					};

				};

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
					element.dispatchEvent( event );

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

		};

	} () );

	window.x.procedures = ( function () {

		return {

			load_config: function () {

				return x.ajax({

					method: "get_json",
					url: chrome.extension.getURL( "/config.json" ),

				})
				.then( function ( config ) {

					return new Promise( function ( resolve ) {

						chrome.storage.local.set({

							config: config,

						}, function () {

							resolve( config );

						})

					});

				});

			},

		};

	} () );
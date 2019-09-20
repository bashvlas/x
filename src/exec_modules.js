
	window[ window.webextension_library_name ].modules.exec = function () {

		var modules = {

		};

		var _app = null;

		// util functions

			var exec_with_data = ( function () {

				var exec = function () {

					var namespace = arguments[ 0 ];
					var module_name = arguments[ 1 ];
					var method_name = arguments[ 2 ];

					var new_arguments = [];

					for ( var i = 0; i < arguments.length; i++ ) {

						new_arguments.push( arguments[ i ] );

					};

					new_arguments.push( pseudo_exec );

					var exec_data = {

						namespace: namespace,
						module_name: module_name,
						method_name: method_name,

						exec_data_arr: [],
						found: true,

						arguments: new_arguments.slice( 3, -1 ),
						output: undefined,

					};

					function pseudo_exec () {

						var local_exec_data = exec.bind( null, namespace ).apply( null, arguments );

						exec_data.exec_data_arr.push( local_exec_data );

						return local_exec_data.output;

					};

					if ( modules[ namespace ] && modules[ namespace ][ module_name ] && modules[ namespace ][ module_name ][ method_name ] ) {

						var current_namespace = namespace;

					} else if ( modules[ "*" ] && modules[ "*" ][ module_name ] && modules[ "*" ][ module_name ][ method_name ] ) {

						var current_namespace = "*";

					} else {

						var current_namespace = null;

					};

					if ( current_namespace ) {

						try {

							exec_data.output = modules[ current_namespace ][ module_name ][ method_name ].apply( null, new_arguments.slice( 3 ) )

							if ( exec_data.output instanceof Promise ) {

								exec_data.output = new Promise( function ( resolve ) {

									exec_data.output
										.then(function(output) {

											resolve(output);

										})
										.catch(function(error) {

											exec_data.error = true;
											exec_data.stack = error.stack;

											resolve( null );

										});

								});

							};

						} catch ( error ) {

							exec_data.error = true;
							exec_data.stack = error.stack;
							exec_data.output = null;

						};

					} else {

						exec_data.found = false;
						exec_data.output = null;

					};

					return exec_data;

				};

				return exec;

			} () );

			var exec_no_data = ( function () {

				var exec = function () {

					var namespace = arguments[ 0 ];
					var module_name = arguments[ 1 ];
					var method_name = arguments[ 2 ];

					var new_arguments = [];

					for ( var i = 0; i < arguments.length; i++ ) {

						new_arguments.push( arguments[ i ] );

					};

					new_arguments.push( _priv.exec.bind( null, namespace ) );

					if ( modules[ namespace ] && modules[ namespace ][ module_name ] && modules[ namespace ][ module_name ][ method_name ] ) {

						var current_namespace = namespace;

					} else if ( modules[ "*" ] && modules[ "*" ][ module_name ] && modules[ "*" ][ module_name ][ method_name ] ) {

						var current_namespace = "*";

					} else {

						var current_namespace = null;

					};

					if ( current_namespace ) {

						try {

							var output = modules[ current_namespace ][ module_name ][ method_name ].apply( null, new_arguments.slice( 3 ) );

							if ( output && typeof output.then === 'function' ) {

								return new Promise( ( resolve ) => {

									output.then( ( result ) => {

										resolve( output );

									}).catch( ( error ) => {

										resolve( null );

									});

								});

							} else {

								return output;

							};

						} catch ( error ) {

							return null;

						};

					} else {

						return null;

					};

				};

				return exec;

			} () );

		//

		var _priv = {

			exec: function () {

				if ( _app.config.mode === "dev" ) {

					var exec_data = exec_with_data.apply( null, arguments );

					if ( exec_data.output instanceof Promise ) {

						exec_data.output.then( () => {

							_app.log.log_exec_data( exec_data );

						});

					} else {

						_app.log.log_exec_data( exec_data );

					};

					return exec_data.output;

				} else {

					return exec_no_data.apply( null, arguments );

				};

			},

		};

		var pub = {

			init: ( app ) => {

				_app = app;

			},

			get_exec: ( namespace ) => {

				return _priv.exec.bind( null, namespace );

			},

			get_exec_with_data: ( namespace ) => {

				return exec_with_data.bind( null, namespace );

			},

			add_module: ( namespace, module_name, module ) => {

				if ( typeof modules[ namespace ] === "undefined" ) {

					modules[ namespace ] = {};

				};

				modules[ namespace ][ module_name ] = module;

			},

		};

		return pub;

	};

	window[ window.webextension_library_name ].modules.exec_tester = function () {

		var x = window[ window.webextension_library_name ];
		var _app = null;

		var _pub = {

			init: function ( app ) {

				_app = app;

			},

			test_conv: async function ( conv_name, json_url ) {

				var test_info = await x.ajax({ method: "get_json", url: json_url });

				var conv_fn_name_arr = Object.keys( test_info );

				for ( var i = 0; i < conv_fn_name_arr.length; i++ ) {

					var conv_fn_name = conv_fn_name_arr[ i ];
					var test_data_arr = test_info[ conv_fn_name ];

					for ( var j = 0; j < test_data_arr.length; j++ ) {

						var test_data = test_data_arr[ j ];

						var input_name = conv_fn_name.split( "_to_" )[ 0 ];
						var output_name = conv_fn_name.split( "_to_" )[ 1 ];

						var io = await Promise.all([

							_pub.unserialize( test_data.input ),
							_pub.unserialize( test_data.output )

						]);

						var input = io[ 0 ];
						var output = io[ 1 ];

						var conv_data = x.conv.get_conv_data( conv_name, input_name, output_name, input );
						var equal_bool = _pub.compare( output, conv_data.output );

						_pub.log_test_case( conv_data, input, output, equal_bool );

					};

				};

			},

			test_module: async function ( exec_with_data, module_name, json_url ) {

				var test_info = await x.ajax({ method: "get_json", url: json_url });

				var method_name_arr = Object.keys( test_info );

				for ( var i = 0; i < method_name_arr.length; i++ ) {

					var method_name = method_name_arr[ i ];
					var test_data_arr = test_info[ method_name ];

					for ( var j = 0; j < test_data_arr.length; j++ ) {

						var test_data = test_data_arr[ j ];

						var input_name = method_name.split( "_to_" )[ 0 ];
						var output_name = method_name.split( "_to_" )[ 1 ];

						var io = await Promise.all([

							_pub.unserialize( test_data.input ),
							_pub.unserialize( test_data.output )

						]);

						var input = io[ 0 ];
						var output = io[ 1 ];

						if ( test_data.test_type === "live" ) {
										
							var webpage_data = {};

							webpage_data.url = input.url;
							webpage_data.response_body = await _app.x.ajax({

								method: "get_text",
								url: webpage_data.url,

							});

							input = [ webpage_data ];

							input.unshift( method_name );
							input.unshift( module_name );

							var exec_data = exec_with_data.apply( null, input );
							var equal_bool = _pub.compare( output, exec_data.output );

							_pub.log_test_case( exec_data, input, output, equal_bool );

						} else {

							input.unshift( method_name );
							input.unshift( module_name );

							var exec_data = exec_with_data.apply( null, input );
							var equal_bool = _pub.compare( output, exec_data.output );

							_pub.log_test_case( exec_data, input, output, equal_bool );

						};

					};

				};

			},

			unserialize: function ( data ) {

				return new Promise( function ( resolve ) {

					if ( data === null || typeof data !== "object" ) {

						resolve( data );

					} else if ( data.__serial_type__ === "element" ) {

						resolve( _pub.html_to_element( data.html ) );

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

					} else if ( data.__link_to_this_text__ ) {

						x.ajax({

							method: "get_text",
							url: data.__link_to_this_text__,

						}).then( function ( text ) {

							resolve( text );

						});

					} else {

						var total_key_count = Object.keys( data ).length;
						var unserialized_key_count = 0;

						Object.keys( data ).forEach( function ( key ) {

							_pub.unserialize( data[ key ] )
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

						equal = _pub.compare( obj_1[ key_arr_1[ i ] ], obj_2[ key_arr_1[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					for ( var i = key_arr_2.length; i--; ) {

						equal = _pub.compare( obj_1[ key_arr_2[ i ] ], obj_2[ key_arr_2[ i ] ] );

						if ( equal === false ) {

							return false;

						};

					};

					return true;

				} else {

					return false;

				};

			},

			log_test_case: function ( exec_data, input, output, equal_bool ) {

				var style = equal_bool ? "color:green" : "color:red";

				console.groupCollapsed( "%c " + exec_data.namespace + "." + exec_data.module_name + "." + exec_data.method_name, style );

				console.log( "input" );
				console.log( input.slice( 3 ) );
				console.log( "expected output" );
				console.log( output );
				console.log( "actual output" );
				console.log( exec_data.output );

				_app.log.log_exec_data( exec_data );

				console.groupEnd();

			}

		};

		return _pub;

	};

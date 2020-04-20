
	window[ window.webextension_library_name ].modules.exec = function () {

		var x = window[ window.webextension_library_name ];

		var types = {

			exec_data: {

				_exec_data_flag: true,

				id: "number",

				parent_id: "number",
				child_id_arr: "arr of number",

				input: "",
				output: "",

			},

		};

		var modules = {

		};

		var _state = {

			call_data_count: 0,
			exec_data_arr: [],
			log_size: 500,

		};

		var _app = null;

		// util functions

			function serialize_exec_data ( exec_data ) {

				delete exec_data.parent;

				exec_data.arguments = x.convert( exec_data.arguments, [[ "simplify", 10 ]]);
				exec_data.output = x.convert( exec_data.output, [[ "simplify", 10 ]]);

				for ( var i = 0; i < exec_data.exec_data_arr.length; i++ ) {

					serialize_exec_data( exec_data.exec_data_arr[ i ] );

				};

			};

			function exec_with_data () {

				var argument_arr = Array.from( arguments );

				_state.call_data_count += 1;

				var parent_exec_data = argument_arr[ 0 ];
				var module_name = argument_arr[ 1 ];
				var method_name = argument_arr[ 2 ];

				var exec_data = {

					module_name: module_name,
					method_name: method_name,

					id: _state.call_data_count,

					parent: parent_exec_data,
					exec_data_arr: [],

					arguments: argument_arr.slice( 3 ),
					output: null,
					found: true,

				};

				if ( module_name === "meta" && method_name === "do_not_log" ) {

					parent_exec_data.do_not_log = true;
					return;

				};

				var new_arguments = argument_arr.slice( 3 );
				new_arguments.push( exec_with_data.bind( null, exec_data ) );

				if ( modules[ module_name ] && modules[ module_name ][ method_name ] ) {

					try {

						exec_data.output = modules[ module_name ][ method_name ].apply( null, new_arguments )

						if ( exec_data.output instanceof Promise ) {

							exec_data.output = new Promise( function ( resolve ) {

								exec_data.output
								.then( function ( output ) {

									exec_data.output = output;
									resolve( output );

								})
								.catch( function ( error ) {

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

				};

				if ( exec_data.do_not_log ) {

					return exec_data.output;

				};

				if ( parent_exec_data ) {

					parent_exec_data.exec_data_arr.push( exec_data );

				} else {

					_state.exec_data_arr.push( exec_data );
					_state.exec_data_arr = _state.exec_data_arr.slice( - _state.log_size );

				};

				if ( parent_exec_data === null ) {

					if ( exec_data.output instanceof Promise ) {

						exec_data.output.then( () => {

							serialize_exec_data( exec_data );
							_app.log.log_exec_data( exec_data );

						});

					} else {

						serialize_exec_data( exec_data );
						_app.log.log_exec_data( exec_data );

					};

				};

				return exec_data.output;

			};

			function get_exec_data () {

				var argument_arr = Array.from( arguments );

				_state.call_data_count += 1;

				var parent_exec_data = argument_arr[ 0 ];
				var module_name = argument_arr[ 1 ];
				var method_name = argument_arr[ 2 ];

				var exec_data = {

					module_name: module_name,
					method_name: method_name,

					id: _state.call_data_count,

					parent: parent_exec_data,
					exec_data_arr: [],

					arguments: argument_arr.slice( 3 ),
					output: null,
					found: true,

				};

				var new_arguments = argument_arr.slice( 3 );
				new_arguments.push( exec_with_data.bind( null, exec_data ) );

				if ( parent_exec_data ) {

					parent_exec_data.exec_data_arr.push( exec_data );

				} else {

					_state.exec_data_arr.push( exec_data );

				};

				if ( modules[ module_name ] && modules[ module_name ][ method_name ] ) {

					try {

						exec_data.output = modules[ module_name ][ method_name ].apply( null, new_arguments )

						if ( exec_data.output instanceof Promise ) {

							exec_data.output = new Promise( function ( resolve ) {

								exec_data.output
								.then( function ( output ) {

									exec_data.output = output;
									resolve( output );

								})
								.catch( function ( error ) {

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

				};

				return exec_data;

			};

			function stubbed_exec () {

				var argument_arr = Array.from( arguments );

				_state.call_data_count += 1;

				var parent_exec_data = argument_arr[ 0 ];
				var module_name = argument_arr[ 1 ];
				var method_name = argument_arr[ 2 ];

				var log_item = parent_exec_data.log_item_arr[ parent_exec_data.log_index ];
				parent_exec_data.log_index += 1;

				var exec_data = {

					module_name: module_name,
					method_name: method_name,

					id: _state.call_data_count,

					parent: parent_exec_data,
					exec_data_arr: [],

					arguments: argument_arr.slice( 3 ),
					output: log_item.output,
					found: true,

				};

				parent_exec_data.exec_data_arr.push( exec_data );

				if ( log_item.promise ) {

					return Promise.resolve( log_item.output );

				} else {

					return log_item.output;

				};

				if ( exec_data.do_not_log ) {

					return exec_data.output;

				};

				return exec_data.output;

			};

			function get_exec_data_with_stubs () {

				var argument_arr = Array.from( arguments );

				_state.call_data_count += 1;

				var parent_exec_data = argument_arr[ 0 ];
				var module_name = argument_arr[ 1 ];
				var method_name = argument_arr[ 2 ];

				var log = argument_arr[ 3 ];
				var log_index = 0;

				var exec_data = {

					module_name: module_name,
					method_name: method_name,

					id: _state.call_data_count,

					parent: parent_exec_data,
					exec_data_arr: [],

					arguments: argument_arr.slice( 3 ),
					output: null,
					found: true,

					log_item_arr: argument_arr[ 3 ],
					log_index: 0,

				};

				var new_arguments = argument_arr.slice( 3 );
				new_arguments.push( stubbed_exec.bind( null, exec_data ) );

				if ( modules[ module_name ] && modules[ module_name ][ method_name ] ) {

					try {

						exec_data.output = modules[ module_name ][ method_name ].apply( null, new_arguments )

						if ( exec_data.output instanceof Promise ) {

							exec_data.output = new Promise( function ( resolve ) {

								exec_data.output
								.then( function ( output ) {

									exec_data.output = output;
									resolve( output );

								})
								.catch( function ( error ) {

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

				};

				return exec_data;

			};

			function exec_no_data () {

				var argument_arr = Array.from( arguments );

				var module_name = argument_arr[ 0 ];
				var method_name = argument_arr[ 1 ];

				var new_arguments = argument_arr.slice( 2 );
				new_arguments.push( exec_no_data );

				if ( modules[ module_name ] && modules[ module_name ][ method_name ] ) {

					try {

						var output = modules[ module_name ][ method_name ].apply( null, new_arguments )

						if ( output instanceof Promise ) {

							return new Promise( ( resolve ) => {

								output.then( ( output ) => {

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

		//

		var _priv = {

			exec: function () {

				if ( _app.config.mode === "dev" ) {

					var argument_arr = Array.from( arguments );
					argument_arr.unshift( null );

					return exec_with_data.apply( null, argument_arr );

				} else {

					var argument_arr = Array.from( arguments );

					return exec_no_data.apply( null, argument_arr );

				};

			},

		};

		var pub = {

			init: ( app ) => {

				_app = app;

				if ( app.config && app.config.log_size ) {

					_state.log_size = app.config.log_size;

				};

			},

			exec: function () {

				if ( _app.config.mode === "dev" ) {

					var argument_arr = Array.from( arguments );
					argument_arr.unshift( null );

					return exec_with_data.apply( null, argument_arr );

				} else {

					var argument_arr = Array.from( arguments );

					return exec_no_data.apply( null, argument_arr );

				};

			},

			get_exec_data: function () {

				var argument_arr = Array.from( arguments );
				argument_arr.unshift( null );

				return get_exec_data.apply( null, argument_arr );

			},

			get_exec_data_arr: function () {

				return _state.exec_data_arr;

			},

			log_exec_data_arr: function () {

				_state.exec_data_arr.forEach( ( d ) => {

					_app.log.log_exec_data( d );

				});

			},

			download_log: function () {

				_state.exec_data_arr.forEach( ( exec_data ) => {

					serialize_exec_data( exec_data );

				});

				var zip = new JSZip();
				zip.file( "log.json", JSON.stringify( _state.exec_data_arr ) );
				zip.generateAsync({
					type: "blob",
					compression: "DEFLATE"
				})
				.then( function ( content ) {

					var url = URL.createObjectURL( content );
					x.util.download_file( "log.zip", url );

					// saveAs( content, "log.zip" );

				});

			},

			add_module: ( module_name, module ) => {

				modules[ module_name ] = module;

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

						var io = await Promise.all([

							_pub.unserialize( test_data.input ),
							_pub.unserialize( test_data.output )

						]);

						var input = io[ 0 ];
						var output = io[ 1 ];

						if ( test_data.test_type === "log_test" ) {

							input.unshift( method_name );
							input.unshift( module_name );

							var exec_data = exec_with_data.apply( null, input );
							var equal_bool = _pub.compare( output, exec_data.output );

							_pub.log_test_case( test_data, exec_data, input, output, equal_bool );

						} else if ( test_data.test_type === "live" ) {
										
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

							_pub.log_test_case( test_data, exec_data, input, output, equal_bool );

						} else {

							input.unshift( method_name );
							input.unshift( module_name );

							var exec_data = exec_with_data.apply( null, input );
							var equal_bool = _pub.compare( output, exec_data.output );

							_pub.log_test_case( test_data, exec_data, input, output, equal_bool );

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

			log_test_case: function ( test_data, exec_data, input, output, equal_bool ) {

				if ( test_data.test_type === "log_test" ) {

					console.log( "log_test" );
					console.log( exec_data );

				} else {

					var style = equal_bool ? "color:green" : "color:red";

					console.groupCollapsed( `%c ${ exec_data.module_name }.${ exec_data.method_name }`, style );

					console.log( "input" );
					console.log( input.slice( 2 ) );
					console.log( "expected output" );
					console.log( output );
					console.log( "actual output" );
					console.log( exec_data.output );

					_app.log.log_exec_data( exec_data );

					console.groupEnd();

				};

			}

		};

		return _pub;

	};

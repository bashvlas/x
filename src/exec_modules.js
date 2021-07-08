
	window[ window.webextension_library_name ].modules.exec = function ( app, mode, script_context ) {

		var x = window[ window.webextension_library_name ];

		var _state = {

			app_name: "app_name",
			call_data_count: 0,

			exec_data_arr: [],
			log_size: 500,

			stub_arr: [],
			stub_index: 0,

		};

		_app = app;
		_state.app_name = app.name;

		// util functions

			function serialize_exec_data ( exec_data ) {

				delete exec_data.parent;

				exec_data.arguments = x.convert( exec_data.arguments, [[ "simplify", 10 ]]);
				exec_data.output = x.convert( exec_data.output, [[ "simplify", 10 ]]);

				for ( var i = 0; i < exec_data.exec_data_arr.length; i++ ) {

					serialize_exec_data( exec_data.exec_data_arr[ i ] );

				};

			};

			function store_exec_data ( exec_data ) {

				// console.log( "store_exec_data", exec_data );

				var top_level_exec_data = exec_data;

				// if ( exec_data.parent || top_level_exec_data.do_not_log ) {

				// 	return;

				// };

				// if ( !top_level_exec_data.do_not_log ) {

					var exec_data_name = "exec_data_" + _app.name + "_" + _app.id + "_" + top_level_exec_data.id;

					serialize_exec_data( top_level_exec_data );

					if ( script_context === "content" ) {

						chrome.runtime.sendMessage({

							module_name: "controller",
							method_name: "log_exec_data",
							arg_arr: [ exec_data_name, top_level_exec_data ],

						});

					} else {

						localforage.setItem( exec_data_name, top_level_exec_data )

					};

					// var storage = {};


					// storage[ exec_data_name ] = JSON.stringify( top_level_exec_data );

					// chrome.storage.local.set( storage );

				// };

			};

			function all_exec_data_are_finished ( exec_data ) {

				if ( exec_data.finished ) {

					for ( var i = exec_data.exec_data_arr.length; i--; ) {

						if ( exec_data.exec_data_arr[ i ].finished === false || all_exec_data_are_finished( exec_data.exec_data_arr[ i ] ) === false ) {

							return false;

						};

					};

					return true;

				} else {

					return false;

				};

			};

			function get_do_not_log ( exec_data ) {

				if ( exec_data.do_not_log ) {

					return true;

				} else {

					for ( var i = exec_data.exec_data_arr.length; i--; ) {

						if ( exec_data.exec_data_arr[ i ].do_not_log === true || get_do_not_log( exec_data.exec_data_arr[ i ] ) === true ) {

							return true;

						};

					};

					return false;

				};

			};

			function handle_exec_data_finished ( exec_data ) {

				// find the top-most exec_data

					var top_level_exec_data = exec_data;

					while ( top_level_exec_data.parent ) {

						top_level_exec_data = top_level_exec_data.parent;

					};

				// check recursively if all child exec_datas are finished

					var all_finished = all_exec_data_are_finished( top_level_exec_data );

					if ( all_finished ) {

						var do_not_log = get_do_not_log( top_level_exec_data );

						if ( !do_not_log ) {

							// store_exec_data( top_level_exec_data );
							app.log.log_exec_data( top_level_exec_data );

						};

					};

			};

			function get_exec_data () {

				var argument_arr = Array.from( arguments );

				_state.call_data_count += 1;

				var parent_exec_data = argument_arr[ 0 ];
				var module_name = argument_arr[ 1 ];
				var method_name = argument_arr[ 2 ];

				var exec_data = {

					app_name: _state.app_name,
					module_name: module_name,
					method_name: method_name,

					id: _state.call_data_count,
					ts: Date.now(),

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

				// if ( _state.stub_arr[ _state.stub_index ] && _state.stub_arr[ _state.stub_index ][ 0 ] === module_name && _state.stub_arr[ _state.stub_index ][ 1 ] === method_name ) {

				// 	if ( new_arguments[ 0 ] === "_do_not_stub_" ) {

				// 		new_arguments.splice( 0, 1 );
				// 		_state.stub_index += 1;

				// 	} else {

				// 		exec_data.output = _state.stub_arr[ _state.stub_index ][ 2 ];
				// 		_state.stub_index += 1;

				// 		return exec_data;

				// 	};

				// };

				if ( app.modules[ module_name ] && app.modules[ module_name ][ method_name ] ) {

					try {

						exec_data.output = app.modules[ module_name ][ method_name ].apply( null, new_arguments )

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

		// not used right now 

			function stubbed_exec () {

				var argument_arr = Array.from( arguments );

				_state.call_data_count += 1;

				var parent_exec_data = argument_arr[ 0 ];
				var module_name = argument_arr[ 1 ];
				var method_name = argument_arr[ 2 ];

				var log_item = parent_exec_data.log_item_arr[ parent_exec_data.log_index ];
				parent_exec_data.log_index += 1;

				var exec_data = {

					app_name: _state.app_name,
					module_name: module_name,
					method_name: method_name,

					id: _state.call_data_count,
					ts: Date.now(),

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

					app_name: _state.app_name,
					module_name: module_name,
					method_name: method_name,

					id: _state.call_data_count,
					ts: Date.now(),

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

				if ( app.modules[ module_name ] && app.modules[ module_name ][ method_name ] ) {

					try {

						exec_data.output = app.modules[ module_name ][ method_name ].apply( null, new_arguments )

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

		// main exec functions

			function exec_with_data () {

				var argument_arr = Array.from( arguments );

				_state.call_data_count += 1;

				var parent_exec_data = argument_arr[ 0 ];
				var module_name = argument_arr[ 1 ];
				var method_name = argument_arr[ 2 ];

				var exec_data = {

					app_name: _state.app_name,
					module_name: module_name,
					method_name: method_name,

					finished: false,

					id: _state.call_data_count,
					ts: Date.now(),

					parent: parent_exec_data,
					exec_data_arr: [],

					arguments: argument_arr.slice( 3 ),
					output: null,
					found: true,

					stub_mode: "none",

				};

				if ( module_name === "meta" && method_name === "do_not_log" ) {

					parent_exec_data.do_not_log = true;
					return;

				} else if ( module_name === "meta" && method_name === "do_log" ) {

					parent_exec_data.do_not_log = false;
					return;

				};

				if ( parent_exec_data ) {

					parent_exec_data.exec_data_arr.push( exec_data );

				} else {

					_state.exec_data_arr.push( exec_data );
					_state.exec_data_arr = _state.exec_data_arr.slice( - _state.log_size );

				};

				var new_arguments = argument_arr.slice( 3 );
				new_arguments.push( exec_with_data.bind( null, exec_data ) );

				if ( _state.stub_arr[ _state.stub_index ] && _state.stub_arr[ _state.stub_index ][ 1 ] === module_name && _state.stub_arr[ _state.stub_index ][ 2 ] === method_name ) {

					exec_data.stub_mode = _state.stub_arr[ _state.stub_index ][ 0 ];

					if ( _state.stub_arr[ _state.stub_index ][ 0 ] === "do_not_stub" ) {

						_state.stub_index += 1;

					} else {

						exec_data.output = _state.stub_arr[ _state.stub_index ][ 3 ];
						exec_data.finished = true;

						_state.stub_index += 1;
						handle_exec_data_finished( exec_data );

						return exec_data.output;

					};

				};

				if ( app.modules[ module_name ] && app.modules[ module_name ][ method_name ] ) {

					try {

						exec_data.output = app.modules[ module_name ][ method_name ].apply( null, new_arguments )

						if ( exec_data.output instanceof Promise ) {

							exec_data.output = new Promise( function ( resolve ) {

								exec_data.output
								.then( function ( output ) {

									exec_data.output = output;
									exec_data.finished = true;

									handle_exec_data_finished( exec_data );

									resolve( output );

								})
								.catch( function ( error ) {

									exec_data.output = null;
									exec_data.error = true;
									exec_data.stack = error.stack;
									exec_data.finished = true;

									handle_exec_data_finished( exec_data );

									resolve( null );

								});

							});

						} else {

							exec_data.finished = true;

							handle_exec_data_finished( exec_data );

						};

					} catch ( error ) {

						exec_data.error = true;
						exec_data.stack = error.stack;
						exec_data.output = null;
						exec_data.finished = true;

						handle_exec_data_finished( exec_data );

					};

				} else {

					exec_data.found = false;
					exec_data.finished = true;

					handle_exec_data_finished( exec_data );

				};

				return exec_data.output;

			};

			function exec_no_data () {

				var argument_arr = Array.from( arguments );

				var module_name = argument_arr[ 0 ];
				var method_name = argument_arr[ 1 ];

				var new_arguments = argument_arr.slice( 2 );
				new_arguments.push( exec_no_data );

				if ( app.modules[ module_name ] && app.modules[ module_name ][ method_name ] ) {

					try {

						var output = app.modules[ module_name ][ method_name ].apply( null, new_arguments )

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

				if ( mode === "dev" ) {

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

			exec: function () {

				if ( mode === "dev" ) {

					var argument_arr = Array.from( arguments );
					argument_arr.unshift( null );

					return exec_with_data.apply( null, argument_arr );

				} else {

					var argument_arr = Array.from( arguments );

					return exec_no_data.apply( null, argument_arr );

				};

			},

			set_stub_arr: function ( stub_arr ) {

				_state.stub_arr = stub_arr;
				_state.stub_index = 0;

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

					app.log.log_exec_data( d );

				});

			},

			log_stored_exec_data_arr: async function () {

				var keys = await localforage.keys();

				for ( var i = 0; i < keys.length; i++ ) {

					var item = await localforage.getItem( keys[ i ] );

					app.log.log_exec_data( item );

				};

			},

			log_total_exec_data_arr: function () {

				var total_exec_data_arr = [];

				chrome.storage.local.get( null, ( storage ) => {

					for ( const key in storage ) {

						if ( key.indexOf( "_exec_data_" ) === 0 ) {

							exec_data = JSON.parse( storage[ key ] );
							total_exec_data_arr.push( exec_data );

						};

					};

					total_exec_data_arr.sort( ( a, b ) => {

						return a.ts - b.ts;

					});

					total_exec_data_arr.forEach( ( exec_data ) => {

						app.log.log_exec_data( exec_data );

					});

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

				app.modules[ module_name ] = module;

			},

		};

		return pub;

	};

	window[ window.webextension_library_name ].modules.exec_tester = function ( app ) {

		var x = window[ window.webextension_library_name ];
		var _app = app;

		var _pub = {

			init: function ( app ) {

			},

			clone: function ( obj ) {

				return JSON.parse( JSON.stringify( obj ) );

			},

			exec_data_to_log: function ( exec_data ) {

				return exec_data.exec_data_arr.map( ( data ) => {

					var log = [];

					log[ 0 ] = data.stub_mode;

					log[ 1 ] = ([]).concat( data.arguments );
					log[ 1 ].unshift( data.method_name );
					log[ 1 ].unshift( data.module_name );

					if ( data.stub_mode === "stub" ) {

						log[ 2 ] = data.output;

					} else if ( data.stub_mode === "do_not_stub" ) {

						log[ 2 ] = null;

					};

					return log;

				});

			},

			log_to_exec_data: function ( log ) {

				var exec_data = {};

				exec_data.found = true;

				exec_data.exec_data_arr = log.map( ( log_item ) => {

					var item = {};

					item.module_name = log_item[ 1 ][ 0 ];
					item.method_name = log_item[ 1 ][ 1 ];
					item.arguments = log_item[ 1 ].slice( 2 );
					item.exec_data_arr = [];
					item.output = log_item[ 2 ];
					item.found = true;

					return item;

				});

				return exec_data;

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

			test_module: async function ( exec, get_exec_data, module_name, json5_url ) {

				var result = await fetch( json5_url );
				var text = await result.text();
				var test_info = JSON5.parse( text );

				var method_name_arr = Object.keys( test_info );

				for ( var i = 0; i < method_name_arr.length; i++ ) {

					var method_name = method_name_arr[ i ];
					var test_data_arr = test_info[ method_name ];

					exec.set_stub_arr([]);

					for ( var j = 0; j < test_data_arr.length; j++ ) {

						var test_data = test_data_arr[ j ];

						var io = await Promise.all([

							_pub.unserialize( test_data.input ),
							_pub.unserialize( test_data.output )

						]);

						var input = io[ 0 ];
						var output = io[ 1 ];

						var input_clone = _pub.clone( input );

						if ( test_data.log ) {

							var stub_arr = test_data.log.map( ( item ) => {

								return [ item[ 0 ], item[ 1 ][ 0 ], item[ 1 ][ 1 ], item[ 2 ] ]

							});

						} else {

							var stub_arr = [];

						};

						exec.set_stub_arr( stub_arr );

						input_clone.unshift( method_name );
						input_clone.unshift( module_name );

						var exec_data = get_exec_data.apply( null, input_clone );
						test_data.actual_log = _pub.exec_data_to_log( exec_data );

						input_clone = input_clone.slice( 2 );

						if ( test_data.log ) {

							test_data.expected_exec_data = _pub.log_to_exec_data( test_data.log );
							test_data.expected_exec_data.arguments = input;
							test_data.expected_exec_data.app_name = "tests";
							test_data.expected_exec_data.module_name = module_name;
							test_data.expected_exec_data.method_name = method_name;

							test_data.log_check_result = _pub.compare( test_data.log, test_data.actual_log );

						} else {

							test_data.log_check_result = true;

						};

						if ( test_data.updated_input ) {

							test_data.updated_input_check_result = _pub.compare( test_data.updated_input, input_clone );
							test_data.actual_updated_input = input_clone;

						} else {

							test_data.updated_input_check_result = true;

						};

						if ( test_data.hasOwnProperty( "output" ) ) {

							test_data.output_check_result = _pub.compare( output, exec_data.output );

						} else {

							test_data.output_check_result = true;

						};

						var equal_bool = test_data.log_check_result && test_data.updated_input_check_result && test_data.output_check_result;

						// await x.util.wait( 10 );
						_pub.log_test_case( test_data, exec_data, input, output, equal_bool );
						// await x.util.wait( 10 );

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
					console.log( input );

					if ( test_data.hasOwnProperty( "output" ) ) {

						console.log( "expected output" );
						console.log( output );
						console.log( "actual output" );
						console.log( exec_data.output );

					};

					if ( test_data.updated_input ) {

						console.log( "expected updated input" );
						console.log( test_data.updated_input );
						console.log( "actual updated input" );
						console.log( test_data.actual_updated_input );

					};

					if ( test_data.log ) {

						console.log( "expected log" );
						_app.log.log_exec_data( test_data.expected_exec_data );

						console.log( "actual log" );
						_app.log.log_exec_data( exec_data );

					} else {

						_app.log.log_exec_data( exec_data );

					};

					console.groupCollapsed( `%c new_test_data`, "color: grey" );

					var new_test_data = {};

					new_test_data.input = test_data.input;

					if ( test_data.hasOwnProperty( "output" ) ) {

						new_test_data.output = exec_data.output;

					};

					if ( test_data.updated_input ) {

						new_test_data.updated_input = test_data.actual_updated_input;

					};

					if ( test_data.log ) {

						new_test_data.log = test_data.actual_log;

					};

					console.log( JSON.stringify( new_test_data, null, "\t" ) );

					console.groupEnd();

					console.groupEnd();

				};

				//  else {

				// 	var style = equal_bool ? "color:green" : "color:red";
				// 	console.groupCollapsed( `%c ${ exec_data.module_name }.${ exec_data.method_name }`, style );

				// 	console.log( "input" );
				// 	console.log( input.slice( 2 ) );
				// 	console.log( "expected output" );
				// 	console.log( output );
				// 	console.log( "actual output" );
				// 	console.log( exec_data.output );

				// 	console.groupCollapsed( `%c new_test_data`, "color: grey" );

				// 	var new_test_data = JSON.parse( JSON.stringify( test_data ) );
				// 	new_test_data.output = exec_data.output;
				// 	new_test_data.input = new_test_data.input.slice( 2 );

				// 	console.log( JSON.stringify( new_test_data, null, "\t" ) );

				// 	console.groupEnd();

				// 	_app.log.log_exec_data( exec_data );

				// 	console.groupEnd();

				// };

			},

		};

		return _pub;

	};

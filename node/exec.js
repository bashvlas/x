
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

			app_name: "app_name",
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

			function store_exec_data ( exec_data ) {

				console.log( "store_exec_data" );

				var top_level_exec_data = exec_data;

				// while ( top_level_exec_data.parent ) {

				// 	top_level_exec_data = top_level_exec_data.parent;

				// };

				if ( exec_data.parent || top_level_exec_data.do_not_log ) {

					return;

				};

				if ( !top_level_exec_data.do_not_log ) {

					var exec_data_name = "_exec_data_" + _app.name + "_" + _app.id + "_" + top_level_exec_data.id;

					console.log( "storing", exec_data_name );
					localforage.setItem( "exec_data_name", top_level_exec_data )

					// var storage = {};

					// serialize_exec_data( top_level_exec_data );

					// storage[ exec_data_name ] = JSON.stringify( top_level_exec_data );

					// chrome.storage.local.set( storage );

				};

			};

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

					id: _state.call_data_count,
					ts: Date.now(),

					parent: parent_exec_data,
					exec_data_arr: [],

					arguments: argument_arr.slice( 3 ),
					output: null,
					found: true,

				};

				if ( module_name === "meta" && method_name === "do_not_log" ) {

					parent_exec_data.do_not_log = true;
					return;

				} else if ( module_name === "meta" && method_name === "do_log" ) {

					parent_exec_data.do_not_log = false;
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

				if ( parent_exec_data ) {

					parent_exec_data.exec_data_arr.push( exec_data );

				} else {

					_state.exec_data_arr.push( exec_data );
					_state.exec_data_arr = _state.exec_data_arr.slice( - _state.log_size );

				};

				// store_exec_data( exec_data );

				if ( parent_exec_data === null ) {

					if ( exec_data.output instanceof Promise ) {

						exec_data.output.then( () => {

							if ( exec_data.do_not_log ) {

								// 88888888

							} else {

								// serialize_exec_data( exec_data );
								store_exec_data( exec_data );
								_app.log.log_exec_data( exec_data );

							};

						});

					} else {

						if ( exec_data.do_not_log ) {

							//

						} else {

							// serialize_exec_data( exec_data );
							store_exec_data( exec_data );
							_app.log.log_exec_data( exec_data );

						};

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

				_state.app_name = app.name;

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

						_app.log.log_exec_data( exec_data );

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

				modules[ module_name ] = module;

			},

		};

		return pub;

	};


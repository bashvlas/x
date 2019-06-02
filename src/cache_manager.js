
	window[ window.webextension_library_name ].cache_manager = function () {

		// cache_item[ 0 ] - id
		// cache_item[ 1 ] - object
		// cache_item[ 2 ] - time of creation
		// cache_item[ 3 ] - maximum age

		var _app = null;

		var _priv = {

			clean_up_cache: async () => {

				var current_ts = Date.now();
				var storage_items = await chrome_p.storage.local.get([ "cache" ]);
				var cache_item_arr = storage_items[ "cache" ];

				for ( var i = cache_item_arr.length; i--; ) {

					// delete cache item if max age is exceeded

					if ( current_ts - cache_item_arr[ i ][ 2 ] > cache_item_arr[ i ][ 3 ] ) {

						cache_item_arr.splice( i, 1 );

					};

				};

				_app.log( "clean_up_cache", cache_item_arr );

				await chrome_p.storage.local.set({ cache: cache_item_arr });

			},

			init_cache: async () => {

				var storage_items = await chrome_p.storage.local.get([ "cache" ]);

				if ( storage_items[ "cache" ] ) { // remove old items from cache if cache exists

					await _priv.clean_up_cache();

				} else { // crate cache if it has not been created yet

					storage_items[ "cache" ] = [];

					await chrome_p.storage.local.set( storage_items );

				};

			}

		};

		var _pub = {

			init: async ( app ) => {

				_app = app;

				setInterval( _priv.clean_up_cache, 5 * 60 * 1000 );

				await _priv.init_cache();

				_app.hub.fire( "cache_manager_ready" );

			},

			set: ( id, obj, max_age ) => {

				if ( !max_age ) {

					max_age = _app.config.cache_max_age * 60 * 60 * 1000;

				};

				return new Promise ( ( resolve ) => {

					chrome.storage.local.get([ "cache" ], ( storage_items ) => {

						var cache_item_arr = storage_items[ "cache" ];
						var current_cache_item_index = null;
						var current_ts = Date.now();

						for ( var i = cache_item_arr.length; i--; ) {

							if ( cache_item_arr[ i ][ 0 ] === id ) {

								current_cache_item_index = i;
								break;

							};

						};

						if ( current_cache_item_index !== null ) {

							cache_item_arr.splice( current_cache_item_index, 1 );

						};

						cache_item_arr.push([ id, obj, current_ts, max_age ]);

						chrome.storage.local.set({ cache: cache_item_arr }, () => {

							resolve( obj );

						});

					});

				});

			},

			get: ( id ) => {

				return new Promise ( ( resolve ) => {

					chrome.storage.local.get([ "cache" ], ( storage_items ) => {

						var cache_item_arr = storage_items[ "cache" ];
						var cache_item_obj = null;

						for ( var i = cache_item_arr.length; i--; ) {

							if ( cache_item_arr[ i ][ 0 ] === id ) {

								cache_item_obj = cache_item_arr[ i ][ 1 ];
								break;

							};

						};

						resolve( cache_item_obj );

					});

				});

			},

		};

		return _pub;

	};


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
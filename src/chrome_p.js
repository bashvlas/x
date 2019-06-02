
	window[ window.webextension_library_name ].chrome_p = ( function () {

		function callback_handler ( resolve, response ) {

			if ( chrome.runtime.lastError ) {

				console.log( chrome.runtime.lastError );

				resolve( null );

			} else {

				resolve( response );

			};

		};

		return {

			storage: {

				local: {

					get: ( input ) => {

						return new Promise( ( resolve ) => {

							chrome.storage.local.get( input, resolve );

						});

					},

					set: ( input ) => {

						return new Promise( ( resolve ) => {

							chrome.storage.local.set( input, resolve );

						});

					},

				},

			},

			contextMenus: {

				removeAll: function () {

					return new Promise( ( resolve ) => {

						chrome.contextMenus.removeAll( resolve );

					});

				},

				create: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.contextMenus.create( input, resolve );

					});

				},

			},

			tabs: {

				executeScript: function ( input_1, input_2 ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.executeScript( input_1, input_2, callback_handler.bind( null, resolve ) );

					});

				},

				sendMessage: function ( input_1, input_2 ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.sendMessage( input_1, input_2, callback_handler.bind( null, resolve ) );

					});

				},

				get: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.get( input, callback_handler.bind( null, resolve ) );

					});

				},

				remove: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.remove( input, callback_handler.bind( null, resolve ) );

					});

				},

				query: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.query( input, resolve );

					});

				},

				create: function ( input ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.create( input, resolve );

					});

				},

				update: function ( input_1, input_2 ) {

					return new Promise( ( resolve ) => {

						chrome.tabs.update( input_1, input_2, resolve );

					});

				},

			},

		};

	} () );
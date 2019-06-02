
	window[ window.webextension_library_name ].bg_api = ( function () {

		if ( typeof chrome.extension === "undefined" ) {

			return;

		};

		var x = window[ window.webextension_library_name ];

		var api_hash = {};

		return {

			init: function () {

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

			},

			register: function ( api_name, method_hash ) {

				api_hash[ api_name ] = method_hash;

			},

			exec: function ( api_name, method_name, input ) {

				if ( chrome.extension.getBackgroundPage && chrome.extension.getBackgroundPage() === window ) {

					return api_hash[ api_name ][ method_name ]( input );

				} else {

					return new Promise ( function ( resolve ) {

						try {

							chrome.runtime.sendMessage({

								_target: "bg_api",
								api_name: api_name,
								method_name: method_name,
								input: input

							}, resolve );

						} catch ( e ) {

							x.log( "error while sending bg message", e );

						};

					});

				};

			},

		};

	} () );

	window[ window.webextension_library_name ].bg_api = ( function () {

		if ( typeof chrome.extension === "undefined" ) {

			return;

		};

		var api_hash = {};

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

		return {

			register: function ( api_name, method_hash ) {

				api_hash[ api_name ] = method_hash;

			},

			exec: function ( api_name, method_name, input ) {

				return new Promise ( function ( resolve ) {

					chrome.runtime.sendMessage({

						_target: "bg_api",
						api_name: api_name,
						method_name: method_name,
						input: input

					}, resolve );

				});

			},

		};

	} () );
	
	function ( text, conv ) {

		try {

			return conv.lib.window.JSON.parse( text );

		} catch ( e ) {

			return undefined;

		};

	};
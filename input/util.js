
	window.x.util = ( function () {
		
		return {

			text_to_json: function ( text ) {
			
				try {
			
					return JSON.parse( text );
			
				} catch ( e ) {
			
					return
			
				};
			
			},

		};

	} () );
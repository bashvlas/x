	
	function ( element ) {
		
		var link_arr = element.querySelectorAll( "a" );

		for ( var i = link_arr.length; i--; ) {

			link_arr[ i ].href = link_arr[ i ].href;

		};

		return element;

	};

	function ( rq, conv ) {

		var selector = rq[ 0 ];
		var callback = rq[ 1 ];
		var element_arr = conv.lib.window.document.querySelectorAll( selector );

		for ( var i = 0; i < element_arr.length; i++ ) {

			if ( element_arr[ 0 ].dataset.detected !== "1" ) {

				element_arr[ 0 ].dataset.detected = "1";
				callback( element_arr[ 0 ] );
				
			};

		};

		var observer = new MutationObserver( function ( records ) {
		
			var element_arr = conv.lib.window.document.querySelectorAll( selector );

			if ( element_arr ) {

				for ( var i = 0; i < element_arr.length; i++ ) {

					if ( element_arr[ i ].dataset.detected !== "1" ) {

						element_arr[ i ].dataset.detected = "1";
						callback( element_arr[ i ] );
						
					};
					
				};

			};

		});

		observer.observe( conv.lib.window.document, { childList: true, subtree: true } );

	};

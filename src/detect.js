
	window.x.detect = ( function () {

		function detect ( rq ) {

			var root_element = rq.root || document;
			var callback = rq.callback;
			var method = rq.method || "normal";

			if ( method === "normal" ) {

				root_element = root_element || document;

				var element_arr = root_element.querySelectorAll( selector );

				for ( var i = 0; i < element_arr.length; i++ ) {

					if ( element_arr[ 0 ].dataset.detected !== "1" ) {

						element_arr[ 0 ].dataset.detected = "1";
						callback( element_arr[ 0 ] );
						
					};

				};

				var observer = new MutationObserver( function ( records ) {
				
					var element_arr = root_element.querySelectorAll( selector );

					if ( element_arr ) {

						for ( var i = 0; i < element_arr.length; i++ ) {

							if ( element_arr[ i ].dataset.detected !== "1" ) {

								element_arr[ i ].dataset.detected = "1";
								callback( element_arr[ i ] );
								
							};
							
						};

					};

				});

				observer.observe( root_element, { childList: true, subtree: true } );

			} else if ( method === "detect_once" ) {

				return new Promise( function ( resolve ) {

					var element = window.document.querySelector( selector );

					if ( element ) {

						resolve( element );

					} else {

						var observer = new MutationObserver( function () {
					
							var element = window.document.querySelector( selector );

							if ( element ) {

								resolve( element );
								observer.disconnect( window.document );

							};

						})

						observer.observe( window.document, { childList: true, subtree: true } );

					};

				});

			} else if ( method === "wait_for" ) {

				return new Promise( function ( resolve ) {

					var resolved = false;
					var element = $( selector, root ).get( 0 );

					if ( element ) {

						resolve( element );

					} else {

						var observer = new MutationObserver( function () {

							if ( resolved === false ) {

								element = $( selector, root ).get( 0 );

								if ( element ) {

									resolve( element );
									observer.disconnect( root );
									resolved = true;

								};

							};

						});

						observer.observe( root, {

							childList: true,
							subtree: true,

						});

					};

				});
				
			};

		};

		return detect;

	} () );
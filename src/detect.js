
	window.x.detect = ( function () {

		function detect ( rq ) {

			var root_element = rq.root || document;
			var target_element = rq.target_element || document;
			var callback = rq.callback;
			var method = rq.method || "normal";
			var selector = rq.selector || "*";

			if ( method === "normal" ) {

				root_element = root_element || document;

				var element_arr = root_element.querySelectorAll( selector );

				for ( var i = 0; i < element_arr.length; i++ ) {

					if ( element_arr[ i ].dataset.detected !== "1" ) {

						element_arr[ i ].dataset.detected = "1";
						callback( element_arr[ i ] );
						
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

			} else if ( method === "once" ) {

				return new Promise( function ( resolve ) {

					var element = root_element.querySelector( selector );

					if ( element ) {

						resolve( element );

					} else {

						var observer = new MutationObserver( function () {
					
							var element = root_element.querySelector( selector );

							if ( element ) {

								resolve( element );
								observer.disconnect( root_element );

							};

						})

						observer.observe( root_element, { childList: true, subtree: true } );

					};

				});

			} else if ( method === "wait_for" ) {

				return new Promise( function ( resolve ) {

					var resolved = false;
					var element = $( selector, root_element ).get( 0 );

					if ( element ) {

						resolve( element );

					} else {

						var observer = new MutationObserver( function () {

							if ( resolved === false ) {

								element = $( selector, root_element ).get( 0 );

								if ( element ) {

									resolve( element );
									observer.disconnect( root_element );
									resolved = true;

								};

							};

						});

						observer.observe( root_element, {

							childList: true,
							subtree: true,

						});

					};

				});
				
			} else if ( method === "detect_attribute_change" ) {

				var observer = new MutationObserver( function ( records ) {
				
					callback( target_element, records );

				});

				observer.observe( target_element, { attributes: true } );

			};

		};

		return detect;

	} () );
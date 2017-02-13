	
	function ( selector, conv ) {

		return new Promise( function ( resolve ) {

			var element = conv.lib.window.document.querySelector( selector );

			if ( element ) {

				resolve( element );

			} else {

				var observer = new MutationObserver( function () {
			
					var element = conv.lib.window.document.querySelector( selector );

					if ( element ) {

						resolve( element );
						observer.disconnect( conv.lib.window.document );

					};

				})

				observer.observe( conv.lib.window.document, { childList: true, subtree: true } );

			};

		});

	};
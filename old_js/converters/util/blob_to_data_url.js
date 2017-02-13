
	function ( blob, conv ) {

		return new Promise ( function ( resolve ) {

			var reader = new FileReader();
			
			reader.onloadend = function () {
			
				resolve( reader.result );
			
			}
			
			reader.readAsDataURL( blob );

		});

	};

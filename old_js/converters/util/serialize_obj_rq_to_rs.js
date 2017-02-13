
	function ( obj ) {

		function serilize ( obj ) {

			// if obj is Element

				if ( obj instanceof Element ) {

					return {

						serialized_element_flag: true,
						html: obj.outerHTML,

					};

				}

			//

			// serialize children if there are children

				else if ( obj !== null && typeof obj === "object" ) {

					Object.keys( obj ).forEach( function ( key ) {

						obj[ key ] = serilize( obj[ key ] );

					});

					return obj;

				}

			//

			// return object if it is not serializeable

				else {

					return obj;
					
				};

			//

		};

		return serilize( obj );

	};
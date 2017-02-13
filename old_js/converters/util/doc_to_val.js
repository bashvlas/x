	
	function ( req, ced ) {

		var doc = req[ 0 ];
		var selector = req[ 1 ];
		var val_type = req[ 2 ];
		var detail = req[ 3 ];

		if ( val_type === "length" ) {

			return doc.querySelectorAll( selector ).length;

		} else {

			var element = doc.querySelector( selector );

			if ( element ) {

				if ( val_type === "text" ) {

					return element.innerText;

				} else if ( val_type === "html" ) {

					return element.innerHTML;
					
				} else if ( val_type === "attr" ) {

					return element.getAttribute( detail );

				} else if ( val_type === "value" ) {

					return element.value;

				} else {

					return null;

				}

			} else {

				return null;

			};

		};

	};
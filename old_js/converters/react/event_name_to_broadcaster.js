
	function ( event_name, conv ) {

		return function ( event ) {

			conv( "edata", "chr", {
				event_name: event_name,
				event: event,
			});

		};

	};
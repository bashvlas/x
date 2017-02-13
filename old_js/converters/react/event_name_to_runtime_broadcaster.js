	
	function ( event_name, conv ) {

		return function ( event ) {

			conv( "send_runtime_message_req", "res", {
				event_name: event_name,
			});

		};

	};
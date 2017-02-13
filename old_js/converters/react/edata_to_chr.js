
	function ( rq, conv ) {

		var event_obj = {
			state: conv.lib.state,
			edata: rq,
		};

		if ( conv.lib.state.config.log ) {

			var conv_data = window.dev_data.conv( "event_obj", rq.event_name + "_chr", event_obj );

			window.dev_data.event_obj_conv_data_arr.push( conv_data );

			conv( "log_conv_data_rq", "rs", conv_data );

		} else {

			conv( "event_obj", rq.event_name + "_chr", event_obj );

		};

	};

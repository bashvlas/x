	
	function ( req, conv ) {

		return conv( req.api_name + "_api_rq", req.name + "_rs", req );

	};
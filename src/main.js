
	( function ( global_name ) {

		window.webextension_library_name = global_name;
		window[ global_name ] = {};
		window[ global_name ].modules = {};

	} ( "webextension_library" ) );
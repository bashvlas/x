( function () {

	var concat = require('concat-files');

	concat([

		"src/main.js",

		"src/util.js",
		"src/hub.js",
		"src/test.js",
		"src/ajax.js",
		"src/query.js",
		"src/storage.js",
		"src/detect.js",
		"src/bg_api.js",
		"src/conv.js",

	], 'dist/webx/webx.js', function ( err ) {

		if ( err ) {

			throw err

		} else {

			console.log( 'done ');
			
		};

	});

} () );
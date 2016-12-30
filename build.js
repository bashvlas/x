( function () {

	var uglify = require( "uglify-js" );
	var fs = require( "fs" );

	var ugly = uglify.minify([

		"input/main.js",

		"input/util.js",
		"input/hub.js",
		"input/ajax.js",
		"input/query.js",
		"input/storage.js",
		"input/detector.js",

	]);

	var beautiful = uglify.minify([

		"input/main.js",

		"input/util.js",
		"input/hub.js",
		"input/ajax.js",
		"input/query.js",
		"input/storage.js",
		"input/detector.js",

	], {

		compress: false,
		mangle: false,
		output: { beautify: true }

	});

	fs.writeFile( "output/x.js", beautiful.code );
	fs.writeFile( "output/x.min.js", ugly.code );

} () );
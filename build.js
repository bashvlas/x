( function () {

	var uglify = require( "uglify-js" );
	var fs = require( "fs" );

	var metadata = JSON.parse( fs.readFileSync( "metadata.json", "utf8" ) );
	metadata.build_id += 1;
	fs.writeFileSync( "metadata.json", JSON.stringify( metadata, null, "\t" ) );

	var metadata_prefix = "/*" + JSON.stringify( metadata ) + "*/\n"

	var ugly = uglify.minify([

		"input/main.js",

		"input/util.js",
		"input/hub.js",
		"input/test.js",
		"input/ajax.js",
		"input/query.js",
		"input/storage.js",
		"input/detector.js",

	]);

	var beautiful = uglify.minify([

		"input/main.js",

		"input/util.js",
		"input/hub.js",
		"input/test.js",
		"input/ajax.js",
		"input/query.js",
		"input/storage.js",
		"input/detector.js",

	], {

		compress: false,
		mangle: false,
		output: { beautify: true }

	});

	fs.writeFile( "output/x.js", metadata_prefix + beautiful.code );
	fs.writeFile( "output/x.min.js", metadata_prefix + ugly.code );

} () );
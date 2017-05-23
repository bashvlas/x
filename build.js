( function () {

	var uglify = require( "uglify-js" );
	var fs = require( "fs" );

	var metadata = JSON.parse( fs.readFileSync( "metadata.json", "utf8" ) );
	metadata.build_id += 1;
	fs.writeFileSync( "metadata.json", JSON.stringify( metadata, null, "\t" ) );

	var metadata_prefix = "/*" + JSON.stringify( metadata ) + "*/\n"

	var ugly = uglify.minify([

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

	]);

	var beautiful = uglify.minify([

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

	], {

		compress: false,
		mangle: false,
		output: { beautify: true }

	});

	fs.writeFile( "dist/x.js", metadata_prefix + beautiful.code, function () {} );
	fs.writeFile( "dist/x.min.js", metadata_prefix + ugly.code, function () {} );

} () );
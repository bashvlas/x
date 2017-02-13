
	function ( req, conv ) {

		var storage = conv.lib.window.chrome.storage.local;

		if ( req.method === "get" ) {

			return new Promise ( function ( resolve ) {

				storage.get( req.item_arr || null, resolve );

			});

		} else if ( req.method === "set" ) {

			return new Promise ( function ( resolve ) {

				storage.set( req.items, resolve );

			});

		} else if ( req.method === "extend" ) {

			return conv( "storage_rq", "rs", {

				method: "GET",
				item_arr: [ req.item_name ],

			})
			.then( function ( items ) {

				conv( "extend_obj_req", "res", [ items[ req.item_name ], req.new_items ] );
				
				return conv( "storage_rq", "rs", {

					method: "SET",
					items: items,

				});

			});

		};

	};

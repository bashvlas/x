	
	function ( promise ) {

		var wrap = {

			promise: promise,
			value: undefined,
			state: "pending",

		};

		wrap.chain = promise.then(

			function ( value ) {

				wrap.value = value;
				wrap.state = "fulfilled";

			},

			function ( error ) {

				wrap.state = "rejected";

			}

		);

		return wrap;

	};
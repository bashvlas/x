	
	function ( rq, ced ) {

		if ( typeof rq.method === "undefined" ) {

			var arr = rq[ 0 ];
			var obj = rq[ 1 ];
			var match_arr = [];

			for ( var i = arr.length; i--; ) {

				var match_flag = true;
				var keys = Object.keys( obj );

				for ( var j = keys.length; j--; ) {

					var key = keys[ j ];

					if ( obj[ key ] !== arr[ i ][ key ] ) {

						match_flag = false;

					};

				};

				if ( match_flag ) {

					match_arr.push( arr[ i ] );

				};

			};

			return match_arr;

		} else if ( rq.method === "remove" ) {

			for ( var i = rq.arr.length; i--; ) {

				var item = rq.arr[ i ];
				var match_bool = true;
				var q_key_arr = Object.keys( rq.q || {} );
				var nq_key_arr = Object.keys( rq.nq || {} );
				
				for ( var j = q_key_arr.length; j--; ) {

					if ( item[ q_key_arr[ j ] ] !== rq.q[ q_key_arr[ j ] ] ) {

						match_bool = false;

					};

				};
				
				for ( var j = nq_key_arr.length; j--; ) {

					if ( item[ nq_key_arr[ j ] ] === rq.q[ nq_key_arr[ j ] ] ) {

						match_bool = false;

					};

				};

				if ( match_bool === true ) {

					rq.arr.splice( i, 1 );

				};

			};

		} else if ( rq.method === "find" ) {

			var match_arr = [];

			for ( var i = rq.arr.length; i--; ) {

				var item = rq.arr[ i ];
				var match_bool = true;
				var q_key_arr = Object.keys( rq.q || {} );
				var nq_key_arr = Object.keys( rq.nq || {} );
				
				for ( var j = q_key_arr.length; j--; ) {

					if ( item[ q_key_arr[ j ] ] !== rq.q[ q_key_arr[ j ] ] ) {

						match_bool = false;

					};

				};
				
				for ( var j = nq_key_arr.length; j--; ) {

					if ( item[ nq_key_arr[ j ] ] === rq.q[ nq_key_arr[ j ] ] ) {

						match_bool = false;

					};

				};

				if ( match_bool === true ) {

					match_arr.push( rq.arr[ i ] );
					
				};
			
			};

			return match_arr;

		};

	};
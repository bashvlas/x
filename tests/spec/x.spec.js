
	describe( "x", function () {

		describe( "util", function () {

			describe( "x.util.text_to_json", function () {

				it( "converts text to json", function () {

					expect( x.util.text_to_json( "{}" ) ).toEqual( {} );
					expect( x.util.text_to_json( "12" ) ).toEqual( 12 );
					expect( x.util.text_to_json( "[2,3,1]" ) ).toEqual( [2,3,1] );
					expect( x.util.text_to_json( "@sfjoii03-=+" ) ).toEqual( undefined );

				});

			});

		});

		describe( "query", function () {

			describe( "x.query.query", function () {

				it( "finds an object in an array", function () {

					expect( x.query.query( [ [ { a: 1 }, { a: 2 }, { a: 3 } ], { a : 2 } ] ) ).toEqual( [ { a : 2 } ] );

				});

			});

		});

	});

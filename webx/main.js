
	function Stars ( container, hub ) {

		var rating = 3;
		var stars = x.util.list_to_arr( container.querySelectorAll( ".star" ) );

		function set_stars ( n ) {

			stars.forEach( function ( star ) {

				star.classList.remove( "star_active" );

			});

			stars.slice( 0, n ).forEach( function ( star ) {

				star.classList.add( "star_active" );

			});

		};

		$( container ).on( "mouseover", ".star", function ( event ) {

			var index = parseInt( event.currentTarget.dataset.n );
			set_stars( index );

		});

		$( container ).on( "mouseleave", function ( event ) {

			$( stars ).removeClass( "star_active" );
			set_stars( rating );

		});

		$( container ).on( "click", ".star", function ( event ) {

			rating = parseInt( event.currentTarget.dataset.n );
			set_stars( rating );

		});

		return {

			get_rating: function () {

				return rating;

			},

		};

	};

	class PageManager {

		constructor ( x ) {

			this.x = x;

		}

		set_page ( page_name ) {

			chrome.storage.local.set({

				last_page_name: page_name,

			});

			$( ".page" ).removeClass( "active" );
			$( ".page[data-page_name='" + page_name + "']" ).addClass( "active" );

		}

	};

	function Dialog ( container, hub ) {

		$( container ).on( "click", function () {

			pub.close();

		});

		$( "#overlay_popup", container ).on( "click", function ( event ) {

			event.stopPropagation();

		});

		$( "#overlay_popup_button", container ).on( "click", function ( event ) {

			pub.close();

		});

		var pub = {

			close: function () {

				$( container ).addClass( "overlay_hidden" );

			},

			open: function ( text ) {

				$( "#overlay_popup_message", container ).text( text );
				$( container ).removeClass( "overlay_hidden" );

			},

		};

		return pub;

	};

	class Drawer {

		constructor ( x, hub ) {

			this.x = x;
			this.hub = hub;
			this.drawer_overlay = document.querySelector( "#drawer_overlay" );

			$( this.drawer_overlay ).on( "click", () => {

				this.hide();

			});

			$( "#drawer", this.drawer_overlay ).on( "click", ( event ) => {

				event.stopPropagation();

			});

			$( ".drawer_item_container", this.drawer_overlay ).on( "click", ".drawer_item", ( event ) => {

				hub.fire( "drawer_item_click", { name: event.currentTarget.dataset.name });

			});

		}

		set_items ( item_name_arr ) {

			$( ".drawer_item", this.drawer_overlay ).addClass( "hidden" );

			item_name_arr.forEach( ( item_name ) => {

				$( ".drawer_item[ data-name = '" + item_name + "' ]", this.drawer_overlay ).removeClass( "hidden" );

			});

		}

		hide () {

			this.drawer_overlay.classList.remove( "opened" );

			this.x.util.wait( 200 )
			.then( () => {

				$( this.drawer_overlay ).css( "display", "hidden" );

			});

		}

		show () {

			$( this.drawer_overlay ).css( "display", "block" );

			this.x.util.wait( 1 )
			.then( () => {

				this.drawer_overlay.classList.add( "opened" );

			});

		}

	};

	class BrowserActionPopup {

	}
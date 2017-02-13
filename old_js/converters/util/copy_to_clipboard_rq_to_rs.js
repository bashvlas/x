
	function ( text, conv ) {

		conv.lib.window.document.oncopy = function( event ) {

			event.clipboardData.setData( "text/plain", text );
			event.preventDefault();

		};

		conv.lib.window.document.execCommand( "Copy", false, null );

		conv.lib.window.document.oncopy = null;

	};
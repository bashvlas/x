
	function ( html, conv ) {

		var template = conv.lib.w.document.createElement("template");
		var shdom_el = document.createElement("div");

		template.innerHTML = html.replace(/{{ROOT}}/g, conv.lib.w.chrome.extension.getURL("/").replace(/\/$/, ""));
		shdom_el.createShadowRoot().appendChild(conv.lib.w.document.importNode(template.content, true));

		return shdom_el;

	};
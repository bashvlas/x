/*{"current_version":"1.2.0","build_id":93,"github_url":"https://github.com/bashvlas/x"}*/
(function() {
    window.x = {};
})();

window.x.util = function() {
    var parser = new DOMParser();
    return {
        open_new_tab: function(url) {
            chrome.tabs.create({
                active: true,
                url: url
            });
        },
        send_to_all_tabs: function(message) {
            chrome.tabs.query({}, function(tab_arr) {
                tab_arr.forEach(function(tab) {
                    chrome.tabs.sendMessage(tab.id, message);
                });
            });
        },
        list_to_arr: function(list) {
            return Array.prototype.slice.call(list);
        },
        text_to_json: function(text) {
            try {
                return JSON.parse(text);
            } catch (e) {
                return undefined;
            }
        },
        text_to_doc: function(text) {
            return parser.parseFromString(text, "text/html");
        },
        html_to_doc: function(html) {
            return parser.parseFromString(html, "text/html");
        },
        doc_to_val: function(rq) {
            var doc = rq[0];
            var selector = rq[1];
            var val_type = rq[2];
            var detail = rq[3];
            if (val_type === "length") {
                return doc.querySelectorAll(selector).length;
            } else {
                var element = doc.querySelector(selector);
                if (element) {
                    if (val_type === "text") {
                        return element.innerText;
                    } else if (val_type === "html") {
                        return element.innerHTML;
                    } else if (val_type === "attr") {
                        return element.getAttribute(detail);
                    } else if (val_type === "value") {
                        return element.value;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }
        },
        is_defined: function(item) {
            if (typeof item === "undefined") {
                return false;
            } else {
                return true;
            }
        },
        is_undefined: function(item) {
            if (typeof item === "undefined") {
                return true;
            } else {
                return false;
            }
        },
        normalize_links: function(element) {
            var link_arr = element.querySelectorAll("a");
            for (var i = link_arr.length; i--; ) {
                link_arr[i].href = link_arr[i].href;
            }
            return element;
        },
        query: function(rq) {
            if (typeof rq.method === "undefined") {
                var arr = rq[0];
                var obj = rq[1];
                var match_arr = [];
                for (var i = arr.length; i--; ) {
                    var match_flag = true;
                    var keys = Object.keys(obj);
                    for (var j = keys.length; j--; ) {
                        var key = keys[j];
                        if (obj[key] !== arr[i][key]) {
                            match_flag = false;
                        }
                    }
                    if (match_flag) {
                        match_arr.push(arr[i]);
                    }
                }
                return match_arr;
            } else if (rq.method === "remove") {
                for (var i = rq.arr.length; i--; ) {
                    var item = rq.arr[i];
                    var match_bool = true;
                    var q_key_arr = Object.keys(rq.q || {});
                    var nq_key_arr = Object.keys(rq.nq || {});
                    for (var j = q_key_arr.length; j--; ) {
                        if (item[q_key_arr[j]] !== rq.q[q_key_arr[j]]) {
                            match_bool = false;
                        }
                    }
                    for (var j = nq_key_arr.length; j--; ) {
                        if (item[nq_key_arr[j]] === rq.q[nq_key_arr[j]]) {
                            match_bool = false;
                        }
                    }
                    if (match_bool === true) {
                        rq.arr.splice(i, 1);
                    }
                }
            } else if (rq.method === "find") {
                var match_arr = [];
                for (var i = rq.arr.length; i--; ) {
                    var item = rq.arr[i];
                    var match_bool = true;
                    var q_key_arr = Object.keys(rq.q || {});
                    var nq_key_arr = Object.keys(rq.nq || {});
                    for (var j = q_key_arr.length; j--; ) {
                        if (item[q_key_arr[j]] !== rq.q[q_key_arr[j]]) {
                            match_bool = false;
                        }
                    }
                    for (var j = nq_key_arr.length; j--; ) {
                        if (item[nq_key_arr[j]] === rq.q[nq_key_arr[j]]) {
                            match_bool = false;
                        }
                    }
                    if (match_bool === true) {
                        match_arr.push(rq.arr[i]);
                    }
                }
                return match_arr;
            }
        },
        extend: function(obj_1, obj_2) {
            Object.keys(obj_2).forEach(function(key) {
                obj_1[key] = obj_2[key];
            });
            return obj_1;
        },
        filter: function(obj) {
            var keys = Object.keys(obj);
            for (var i = keys.length; i--; ) {
                if (!obj[keys[i]]) {
                    delete obj[keys[i]];
                }
            }
            return obj;
        },
        wait: function(time) {
            return new Promise(function(resolve) {
                setTimeout(resolve, time);
            });
        },
        cookie_to_hash: function(cookie) {
            var pair_arr = cookie.split(/;\s*/);
            var cookie_hash = {};
            for (var i = 0; i < pair_arr.length; i++) {
                pair_arr[i] = pair_arr[i].split("=");
                cookie_hash[pair_arr[i][0]] = pair_arr[i][1];
            }
            return cookie_hash;
        },
        pad: function(n) {
            return n < 10 ? "0" + n : "" + n;
        },
        trigger: function(element, event_name) {
            if ("createEvent" in document) {
                var event = document.createEvent("HTMLEvents");
                event.initEvent(event_name, false, true);
                element.dispatchEvent(event);
            } else {
                element.fireEvent("on" + event_name);
            }
        },
        open_window_with_post_data: function(url, data) {
            var form = document.createElement("form");
            var input = document.createElement("input");
            form.action = url;
            form.method = "POST";
            form.target = "_blank";
            input.name = "data";
            input.value = JSON.stringify(data);
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
}();

window.x.procedures = function() {
    return {
        load_config: function() {
            return x.ajax({
                method: "get_json",
                url: chrome.extension.getURL("/config.json")
            }).then(function(config) {
                return new Promise(function(resolve) {
                    chrome.storage.local.set({
                        config: config
                    }, function() {
                        resolve(config);
                    });
                });
            });
        }
    };
}();

window.x.hub = function() {
    var events = {};
    function add_one(name, observer) {
        if (typeof events[name] === "undefined") {
            events[name] = [];
        }
        events[name].push(observer);
    }
    function remove(name) {
        events[name] = undefined;
    }
    return {
        fire: function(name, data) {
            if (typeof events[name] !== "undefined") {
                data = data ? data : {};
                data.event_name = name;
                events[name].forEach(function(observer) {
                    observer(data);
                });
            }
        },
        add: function(observers) {
            Object.keys(observers).forEach(function(name) {
                add_one(name, observers[name]);
            });
        },
        send_runtime_message_rq_to_rs: function(rq) {
            window.chrome.runtime.sendMessage(rq);
        },
        send_tab_message_rq_to_rs: function(req) {
            if (req.all_tabs_flag) {
                window.chrome.tabs.query({}, function(tab_arr) {
                    tab_arr.forEach(function(tab) {
                        window.chrome.tabs.sendMessage(tab.id, req);
                    });
                });
            } else {
                return new Promise(function(resolve) {
                    window.chrome.tabs.sendMessage(req.tab_id, req, resolve);
                });
            }
        }
    };
};

window.x.tester = function() {
    return {
        test_conv: function(conv_name, json_url) {
            x.ajax({
                method: "get_json",
                url: json_url
            }).then(function(test_data) {
                Object.keys(test_data).forEach(function(conv_fn_name) {
                    test_data[conv_fn_name].forEach(function(test_data) {
                        var input_name = conv_fn_name.split("_to_")[0];
                        var output_name = conv_fn_name.split("_to_")[1];
                        Promise.all([ x.tester.unserialize(test_data.input), x.tester.unserialize(test_data.output) ]).then(function(io) {
                            var input = io[0];
                            var output = io[1];
                            var conv_data = x.conv.get_conv_data(conv_name, input_name, output_name, input);
                            var equal_bool = x.tester.compare(output, conv_data.output);
                            x.tester.log_test_case(conv_data, input, output, equal_bool);
                        });
                    });
                });
            });
        },
        unserialize: function(data) {
            return new Promise(function(resolve) {
                if (data === null || typeof data !== "object") {
                    resolve(data);
                } else if (data.__serial_type__ === "element") {
                    resolve(x.tester.html_to_element(data.html));
                } else if (data.__serial_type__ === "date") {
                    resolve(new Date(data.ts));
                } else if (data.__serial_type__ === "page_data") {
                    x.ajax({
                        method: "get_text",
                        url: "pages/" + encodeURIComponent(encodeURIComponent(data.url))
                    }).then(function(text) {
                        resolve({
                            url: data.url,
                            text: text,
                            doc: x.util.html_to_doc(text)
                        });
                    });
                } else {
                    var total_key_count = Object.keys(data).length;
                    var unserialized_key_count = 0;
                    Object.keys(data).forEach(function(key) {
                        x.tester.unserialize(data[key]).then(function(value) {
                            data[key] = value;
                            unserialized_key_count += 1;
                            if (unserialized_key_count === total_key_count) {
                                resolve(data);
                            }
                        });
                    });
                    if (Object.keys(data).length === 0) {
                        resolve(data);
                    }
                }
            });
        },
        html_to_element: function(html) {
            var parser = new DOMParser();
            var dom = parser.parseFromString(html, "text/html");
            return dom.body.firstElementChild;
        },
        compare: function(obj_1, obj_2) {
            if (obj_1 === obj_2) {
                return true;
            } else if (obj_1 instanceof Date && obj_2 instanceof Date) {
                return obj_1.getTime() === obj_2.getTime();
            } else if (obj_1 === null && obj_2 === null) {
                return true;
            } else if (typeof obj_1 === "object" && typeof obj_2 === "object" && obj_1 !== null && obj_2 !== null) {
                var key_arr_1 = Object.keys(obj_1);
                var key_arr_2 = Object.keys(obj_2);
                var equal;
                for (var i = key_arr_1.length; i--; ) {
                    equal = x.tester.compare(obj_1[key_arr_1[i]], obj_2[key_arr_1[i]]);
                    if (equal === false) {
                        return false;
                    }
                }
                for (var i = key_arr_2.length; i--; ) {
                    equal = x.tester.compare(obj_1[key_arr_2[i]], obj_2[key_arr_2[i]]);
                    if (equal === false) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        log_test_case: function(conv_data, input, output, equal_bool) {
            var style = equal_bool ? "color:green" : "color:red";
            console.groupCollapsed("%c " + conv_data.namespace + ": " + conv_data.from_name + " => " + conv_data.to_name, style);
            console.log(input);
            console.log(output);
            console.log(conv_data.output);
            x.conv.log_conv_data(conv_data);
            console.groupEnd();
        }
    };
}();

window.x.ajax = function() {
    function open_window_with_post_data(url, data) {
        var form = document.createElement("form");
        var input = document.createElement("input");
        form.action = url;
        form.method = "POST";
        form.target = "_blank";
        input.name = "data";
        input.value = JSON.stringify(data);
        form.appendChild(input);
        form.style.display = "none";
        document.body.appendChild(form);
        form.submit();
    }
    function obj_to_form_data(obj) {
        return Object.keys(obj).map(function(name) {
            return encodeURIComponent(name) + "=" + encodeURIComponent(obj[name]);
        }).join("&");
    }
    function http(request) {
        var body;
        if (request.method === "POST" && request.content_type === "application/x-www-form-urlencoded") {
            body = x.ajax.obj_to_form_data(request.body);
        } else if (request.method === "POST" && request.content_type === "application/json") {
            body = JSON.stringify(request.body);
        }
        return window.fetch(request.url, {
            method: request.method,
            credentials: "include",
            headers: new Headers({
                "Content-Type": request.content_type,
                Accept: request.accept
            }),
            body: body
        }).then(function(r) {
            return r.text().then(function(text) {
                return {
                    head: {
                        error: false,
                        code: 0,
                        http_req: request,
                        status: r.status,
                        headers: r.headers
                    },
                    body: {
                        text: text
                    }
                };
            });
        }).catch(function(response) {
            return {
                head: {
                    error: true,
                    code: 1,
                    http_req: request
                }
            };
        });
    }
    function xhr(rq) {
        return new Promise(function(resolve) {
            function readystatechange_listener() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve({
                            error: false,
                            status: this.status,
                            response: this.response
                        });
                    } else {
                        resolve({
                            error: true,
                            status: this.status,
                            response: this.response
                        });
                    }
                }
            }
            function timeout_listener() {}
            function load_listener() {
                if (this.status === 200) {
                    resolve({
                        error: false,
                        status: this.status,
                        response: this.response
                    });
                } else {
                    resolve({
                        status: this.status,
                        error: true
                    });
                }
            }
            function error_listener() {
                resolve({
                    status: this.status,
                    error: true
                });
            }
            var xhr = new XMLHttpRequest();
            xhr.open(rq.method, rq.url, true);
            if (rq.timeout) {
                xhr.timeout = rq.timeout;
            }
            xhr.responseType = rq.response_type || "text";
            if (rq.headers) {
                Object.keys(rq.headers).forEach(function(key) {
                    xhr.setRequestHeader(key, rq.headers[key]);
                });
            }
            if (rq.rq_body_type === "json") {
                xhr.setRequestHeader("Content-Type", "application/json");
            }
            xhr.addEventListener("load", load_listener);
            xhr.addEventListener("error", error_listener);
            xhr.addEventListener("timeout", timeout_listener);
            if (rq.rq_body_type === "json") {
                var rq_body = JSON.stringify(rq.rq_body);
            } else if (rq.rq_body_type === "form_data") {
                var rq_body = new FormData();
                Object.keys(rq.rq_body).forEach(function(key) {
                    rq_body.append(key, rq.rq_body[key]);
                });
            } else {
                var rq_body = null;
            }
            xhr.send(rq_body);
        });
    }
    function ajax(rq) {
        var headers = new Headers(rq.headers || {});
        var credentials = rq.credentials || "include";
        if (rq.method === "get_json") {
            return window.fetch(rq.url, {
                method: "GET",
                credentials: "include",
                headers: headers
            }).then(function(r) {
                return r.text().then(function(text) {
                    return x.util.text_to_json(text);
                });
            }).catch(function(response) {
                return null;
            });
        } else if (rq.method === "get_doc") {
            return window.fetch(rq.url, {
                method: "GET",
                credentials: credentials,
                headers: headers
            }).then(function(r) {
                return r.text().then(function(text) {
                    return x.util.text_to_doc(text);
                });
            }).catch(function(response) {
                return null;
            });
        } else if (rq.method === "get_blob") {
            return window.fetch(rq.url, {
                method: "GET",
                credentials: credentials,
                headers: headers
            }).then(function(r) {
                return r.blob();
            }).catch(function(response) {
                return null;
            });
        } else if (rq.method === "get_text") {
            return window.fetch(rq.url, {
                method: "GET",
                credentials: credentials,
                headers: headers
            }).then(function(r) {
                return r.text();
            }).catch(function(response) {
                return null;
            });
        } else if (rq.method === "post_json_get_json") {
            headers.append("Content-Type", "application/json");
            return window.fetch(rq.url, {
                method: "POST",
                credentials: credentials,
                body: JSON.stringify(rq.body),
                headers: headers
            }).then(function(r) {
                return r.text().then(function(text) {
                    return x.util.text_to_json(text);
                });
            }).catch(function(response) {
                return null;
            });
        } else if (rq.method === "post") {
            headers.append("Content-Type", "application/x-www-form-urlencoded");
            return window.fetch(rq.url, {
                method: "POST",
                credentials: credentials,
                body: obj_to_form_data(rq.body),
                headers: headers
            }).then(function(r) {
                return r.text().then(function(text) {
                    return x.util.text_to_json(text);
                });
            }).catch(function(response) {
                return null;
            });
        } else if (rq.method === "http") {
            return http(rq.data);
        } else if (rq.method === "xhr") {
            return xhr(rq.data);
        }
    }
    return ajax;
}();

window.x.query = function() {
    return {
        query: function(rq) {
            if (typeof rq.method === "undefined") {
                var arr = rq[0];
                var obj = rq[1];
                var match_arr = [];
                for (var i = arr.length; i--; ) {
                    var match_flag = true;
                    var keys = Object.keys(obj);
                    for (var j = keys.length; j--; ) {
                        var key = keys[j];
                        if (obj[key] !== arr[i][key]) {
                            match_flag = false;
                        }
                    }
                    if (match_flag) {
                        match_arr.push(arr[i]);
                    }
                }
                return match_arr;
            } else if (rq.method === "remove") {
                for (var i = rq.arr.length; i--; ) {
                    var item = rq.arr[i];
                    var match_bool = true;
                    var q_key_arr = Object.keys(rq.q || {});
                    var nq_key_arr = Object.keys(rq.nq || {});
                    for (var j = q_key_arr.length; j--; ) {
                        if (item[q_key_arr[j]] !== rq.q[q_key_arr[j]]) {
                            match_bool = false;
                        }
                    }
                    for (var j = nq_key_arr.length; j--; ) {
                        if (item[nq_key_arr[j]] === rq.q[nq_key_arr[j]]) {
                            match_bool = false;
                        }
                    }
                    if (match_bool === true) {
                        rq.arr.splice(i, 1);
                    }
                }
            } else if (rq.method === "find") {
                var match_arr = [];
                for (var i = rq.arr.length; i--; ) {
                    var item = rq.arr[i];
                    var match_bool = true;
                    var q_key_arr = Object.keys(rq.q || {});
                    var nq_key_arr = Object.keys(rq.nq || {});
                    for (var j = q_key_arr.length; j--; ) {
                        if (item[q_key_arr[j]] !== rq.q[q_key_arr[j]]) {
                            match_bool = false;
                        }
                    }
                    for (var j = nq_key_arr.length; j--; ) {
                        if (item[nq_key_arr[j]] === rq.q[nq_key_arr[j]]) {
                            match_bool = false;
                        }
                    }
                    if (match_bool === true) {
                        match_arr.push(rq.arr[i]);
                    }
                }
                return match_arr;
            }
        }
    };
}();

window.x.storage = function() {
    return {
        get: function(path) {
            var path_arr = path.split(".");
            var current_object;
            return new Promise(function(resolve) {
                window.chrome.storage.local.get(null, function(items) {
                    current_object = items;
                    for (var i = 0; i < path_arr.length; i++) {
                        if (typeof current_object[path_arr[i]] !== undefined) {
                            current_object = current_object[path_arr[i]];
                        } else {
                            resolve(undefined);
                            break;
                        }
                    }
                    resolve(current_object);
                });
            });
        },
        set: function(path, value) {
            var path_arr = path.split(".");
            var current_object;
            var success;
            return new Promise(function(resolve) {
                window.chrome.storage.local.get(null, function(items) {
                    current_object = items;
                    for (var i = 0; i < path_arr.length; i++) {
                        if (i === path_arr.length - 1) {
                            current_object[path_arr[i]] = value;
                        } else if (typeof current_object[path_arr[i]] !== undefined) {
                            current_object = current_object[path_arr[i]];
                        } else {
                            resolve(false);
                            break;
                        }
                    }
                    window.chrome.storage.local.set(items, resolve.bind(this, true));
                });
            });
        }
    };
}();

window.x.detect = function() {
    function detect(rq) {
        var root_element = rq.root || document;
        var callback = rq.callback;
        var method = rq.method || "normal";
        var selector = rq.selector || "*";
        if (method === "normal") {
            root_element = root_element || document;
            var element_arr = root_element.querySelectorAll(selector);
            for (var i = 0; i < element_arr.length; i++) {
                if (element_arr[i].dataset.detected !== "1") {
                    element_arr[i].dataset.detected = "1";
                    callback(element_arr[i]);
                }
            }
            var observer = new MutationObserver(function(records) {
                var element_arr = root_element.querySelectorAll(selector);
                if (element_arr) {
                    for (var i = 0; i < element_arr.length; i++) {
                        if (element_arr[i].dataset.detected !== "1") {
                            element_arr[i].dataset.detected = "1";
                            callback(element_arr[i]);
                        }
                    }
                }
            });
            observer.observe(root_element, {
                childList: true,
                subtree: true
            });
        } else if (method === "once") {
            return new Promise(function(resolve) {
                var element = root_element.querySelector(selector);
                if (element) {
                    resolve(element);
                } else {
                    var observer = new MutationObserver(function() {
                        var element = root_element.querySelector(selector);
                        if (element) {
                            resolve(element);
                            observer.disconnect(root_element);
                        }
                    });
                    observer.observe(root_element, {
                        childList: true,
                        subtree: true
                    });
                }
            });
        } else if (method === "wait_for") {
            return new Promise(function(resolve) {
                var resolved = false;
                var element = $(selector, root_element).get(0);
                if (element) {
                    resolve(element);
                } else {
                    var observer = new MutationObserver(function() {
                        if (resolved === false) {
                            element = $(selector, root_element).get(0);
                            if (element) {
                                resolve(element);
                                observer.disconnect(root_element);
                                resolved = true;
                            }
                        }
                    });
                    observer.observe(root_element, {
                        childList: true,
                        subtree: true
                    });
                }
            });
        }
    }
    return detect;
}();

window.x.bg_api = function() {
    if (typeof chrome.extension === "undefined") {
        return;
    }
    var api_hash = {};
    chrome.runtime.onMessage.addListener(function(message, sender, callback) {
        if (message._target === "bg_api") {
            if (api_hash[message.api_name] && api_hash[message.api_name][message.method_name]) {
                var output = api_hash[message.api_name][message.method_name](message.input);
                if (output instanceof Promise) {
                    output.then(callback);
                    return true;
                } else {
                    callback(output);
                }
            }
        }
    });
    return {
        register: function(api_name, method_hash) {
            api_hash[api_name] = method_hash;
        },
        exec: function(api_name, method_name, input) {
            return new Promise(function(resolve) {
                chrome.runtime.sendMessage({
                    _target: "bg_api",
                    api_name: api_name,
                    method_name: method_name,
                    input: input
                }, resolve);
            });
        }
    };
}();

window.x.conv = function() {
    var converters_hash = {};
    var options = {
        debug: true,
        silence: []
    };
    var conv_data_arr = [];
    var conv_with_data = function() {
        var conv = function(namespace, from_name, to_name, input) {
            var conv_hash = converters_hash[namespace];
            var conv_name = from_name + "_to_" + to_name;
            var conv_data = {
                namespace: namespace,
                from_name: from_name,
                to_name: to_name,
                conv_data_arr: [],
                found: true,
                input: input,
                output: undefined
            };
            function pseudo_conv(namespace, from_name, to_name, input) {
                var local_conv_data = conv(namespace, from_name, to_name, input);
                conv_data.conv_data_arr.push(local_conv_data);
                return local_conv_data.output;
            }
            if (conv_hash[conv_name]) {
                try {
                    conv_data.output = conv_hash[conv_name](input, pseudo_conv);
                    if (conv_data.output instanceof Promise) {
                        conv_data.output = new Promise(function(resolve) {
                            conv_data.output.then(function(output) {
                                resolve(output);
                            }).catch(function(error) {
                                conv_data.error = true;
                                conv_data.stack = error.stack;
                            });
                        });
                    }
                } catch (error) {
                    conv_data.error = true;
                    conv_data.stack = error.stack;
                }
            } else {
                conv_data.found = false;
            }
            return conv_data;
        };
        return conv;
    }();
    var conv_no_data = function() {
        var conv = function(namespace, from_name, to_name, input) {
            var conv_hash = converters_hash[namespace];
            if (conv_hash && conv_hash[from_name + "_to_" + to_name]) {
                try {
                    var output = conv_hash[from_name + "_to_" + to_name](input, conv);
                    if (output instanceof Promise) {
                        return new Promise(function(resolve, reject) {
                            output.then(function(output) {
                                resolve(output);
                            }).catch(function(error) {
                                resolve(undefined);
                            });
                        });
                    } else {
                        return output;
                    }
                } catch (error) {
                    return undefined;
                }
            } else {
                return undefined;
            }
        };
        return conv;
    }();
    function conv(namespace, from_name, to_name, input) {
        if (options.debug) {
            var conv_data = conv_with_data(namespace, from_name, to_name, input);
            if (options.silence && options.silence.indexOf(from_name + "_to_" + to_name) === -1) {
                x.conv.log_conv_data(conv_data);
                conv_data_arr.push(conv_data);
            }
            return conv_data.output;
        } else {
            return conv_no_data(namespace, from_name, to_name, input);
        }
        var fn = converters_hash[namespace][from_name + "_to_" + to_name];
        return fn(input, conv);
    }
    conv.register = function(namespace, hash) {
        converters_hash[namespace] = hash;
    };
    conv.set_options = function(new_options) {
        options = new_options;
    };
    conv.log_conv_data = function(conv_data) {
        var title = "%c " + conv_data.namespace + ": " + conv_data.from_name + " => " + conv_data.to_name;
        if (conv_data.error) {
            console.groupCollapsed(title, "color: red");
            console.log(conv_data.input);
            console.log(conv_data.stack);
        } else if (!conv_data.found) {
            console.groupCollapsed(title, "color: #F0AD4E");
            console.log(conv_data.input);
        } else {
            console.groupCollapsed(title, "color: green");
            console.log(conv_data.input);
            console.log(conv_data.output);
        }
        conv_data.conv_data_arr.forEach(function(conv_data) {
            x.conv.log_conv_data(conv_data);
        });
        console.groupEnd();
    };
    conv.get_conv_data = conv_with_data;
    conv.flush = function() {
        conv_data_arr.forEach(conv.log_conv_data);
    };
    return conv;
}();
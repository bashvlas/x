/*{"current_version":"1.2.0","build_id":24,"github_url":"https://github.com/bashvlas/x"}*/
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
        trigger: function(name, data) {
            if (typeof events[name] !== "undefined") {
                data = data ? data : {};
                data.event_name = name;
                events[name].forEach(function(observer) {
                    observer(data);
                });
            }
        },
        listen: function(observers) {
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
}();

window.x.test = function() {
    return {
        test: function(fn_name, fn, input_url, output_url) {
            return Promise.all([ x.ajax.fetch({
                method: "get_doc",
                url: input_url
            }), x.ajax.fetch({
                method: "get_json",
                url: output_url
            }) ]).then(function(arr) {
                var input = arr[0].body.firstElementChild;
                var output = arr[1];
                var real_output = fn(arr[0]);
                var equal_bool = x.test.compare(output, real_output);
                x.test.log_test_case(fn_name, input, output, real_output, equal_bool);
            });
        },
        compare: function(obj_1, obj_2) {
            if (obj_1 === obj_2) {
                return true;
            } else if (obj_1 === null && obj_2 === null) {
                return true;
            } else if (typeof obj_1 === "object" && typeof obj_2 === "object") {
                var key_arr_1 = Object.keys(obj_1);
                var key_arr_2 = Object.keys(obj_2);
                var equal;
                for (var i = key_arr_1.length; i--; ) {
                    equal = x.test.compare(obj_1[key_arr_1[i]], obj_2[key_arr_1[i]]);
                    if (equal === false) {
                        return false;
                    }
                }
                for (var i = key_arr_2.length; i--; ) {
                    equal = x.test.compare(obj_1[key_arr_2[i]], obj_2[key_arr_2[i]]);
                    if (equal === false) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        log_test_case: function(fn_name, input, output, real_output, equal_bool) {
            var style = equal_bool ? "color:green" : "color:red";
            console.groupCollapsed("%c " + fn_name, style);
            console.log(input);
            console.log(output);
            console.log(real_output);
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
    function ajax(rq) {
        var headers = new Headers(rq.headers || {});
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
                credentials: "include",
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
                credentials: "include",
                headers: headers
            }).then(function(r) {
                return r.blob();
            }).catch(function(response) {
                return null;
            });
        } else if (rq.method === "get_text") {
            return window.fetch(rq.url, {
                method: "GET",
                credentials: "include",
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
                credentials: "include",
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
                credentials: "include",
                body: obj_to_form_data(rq.body),
                headers: headers
            }).then(function(r) {
                return r.text().then(function(text) {
                    return x.util.text_to_json(text);
                });
            }).catch(function(response) {
                return null;
            });
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
                if (element_arr[0].dataset.detected !== "1") {
                    element_arr[0].dataset.detected = "1";
                    callback(element_arr[0]);
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
        } else if (method === "detect_once") {
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
                var element = $(selector, root).get(0);
                if (element) {
                    resolve(element);
                } else {
                    var observer = new MutationObserver(function() {
                        if (resolved === false) {
                            element = $(selector, root).get(0);
                            if (element) {
                                resolve(element);
                                observer.disconnect(root);
                                resolved = true;
                            }
                        }
                    });
                    observer.observe(root, {
                        childList: true,
                        subtree: true
                    });
                }
            });
        }
    }
    return detect;
}();

window.x.ajax = function() {
    var api_hash = {};
    chrome.runtime.onMessage.addListener(function(message, sender, callback) {
        if (message._target === "bg_api") {
            if (api_hash[message.api_name] && api_hash[message.api_name][message.method_name]) {
                var output = api_hash[message.api_name][message.method_name](input);
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
//$Id: $
var reachContext = 'social';
var reachDomain = 'zoho';
var reachServerUrl = "https://" + reachContext + "." + reachDomain + ".com";
var m_selString = '';
var tabUrl = '';
var action = 'url';
var redirect = 'us';
var imageurl = '';
var islogin = false;
var Obj = '';
var uninstallUrl = "https://survey.zohopublic.com/zs/IfCutb?browser=Chrome";
var countrequests = 0;
var params = {
    isUs: false,
    usZuid: '',
    isEu: false,
    euZuid: '',
    isIn: false,
    inZuid: '',
    isAu: false,
    auZuid: ''
}
var isCheckedJson = {};
var contextMenuTitle = "Go to Zoho Social";
var version = "1.29";

chrome.contextMenus.create({
    title: contextMenuTitle,
    contexts: ["browser_action"],
    onclick: function() {
        chrome.storage.sync.get('dc', function(options) {
            if (options.dc === undefined) {
                window.open(reachServerUrl, '_blank');
            } else {
                var url = 'https://' + reachContext + '.' + reachDomain + '.' + options.dc;
                window.open(url, '_blank');
            }
        });
    }
});

chrome.contextMenus.create({
    title: "Share Text via zShare",
    contexts: ["selection"],
    onclick: function(info, tab) {
        tab = tab;
        action = 'selection';
        chrome.tabs.executeScript({
            code: "window.getSelection().toString();"
        }, function(selection) {
            m_selString = selection[0];
            chrome.tabs.executeScript(tab.id, {
                file: 'js/zis_load.js'
            });
        });
    }
});

chrome.contextMenus.create({
    title: "Share Image via zShare",
    contexts: ["image"],
    onclick: function(info, tab) {
        tab = tab;
        action = 'imageselection';
        imageurl = info.srcUrl;
        tabUrl = tab.url;
        chrome.tabs.executeScript(tab.id, {
            file: 'js/zis_load.js'
        });

    }
});

chrome.contextMenus.create({
    title: "Share Page via zShare",
    contexts: ["page"],
    onclick: function(info, tab) {
        action = 'url';
        tabUrl = tab.url;
        chrome.tabs.executeScript(tab.id, {
            file: 'js/zis_load.js'
        });
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    action = 'url';
    tabUrl = tab.url;
    chrome.tabs.executeScript(tab.id, {
        file: 'js/zis_load.js'
    });
});

function bgisJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function resetAjaxCallParams() {
    countrequests = 0;
    params = {
        isUs: false,
        usZuid: '',
        isEu: false,
        euZuid: '',
        isIn: false,
        inZuid: '',
        isAu: false,
        auZuid: ''
    }
}

function setUninstallUrlAjax() {
    var url = '';
    var zuid = '';
    var dc = '';
    if (params.isUs) {
        zuid = params.usZuid;
        dc = 'com';
    } else if (params.isEu) {
        zuid = params.euZuid;
        dc = 'eu';
    } else if (params.isIn) {
        zuid = params.inZuid;
        dc = 'in';
    } else if (params.isAu) {
        zuid = params.auZuid;
        dc = 'com.au';
    }
    if (zuid !== '' && zuid !== undefined) {
        url = uninstallUrl + '&zuid=' + zuid + '&dc=' + dc;
        chrome.runtime.setUninstallURL(url);
        isCheckedJson.isUninstallUrlSet = true;
        isCheckedJson.zuid = zuid;
        isCheckedJson.dc = dc;
        chrome.storage.sync.set(isCheckedJson, function() {});
    }
    resetAjaxCallParams();
}

function getCheckLoginURL(domain) {
    var url = "https://" + reachContext + "." + reachDomain + "." + domain + "/CheckUserLogin.do";
    return url;
}

function bgmakeajaxcall(server) {
    var domain = server === "us" ? "com" : (server === "au" ? "com.au" : server);
    var url = getCheckLoginURL(domain);
    var data = "action=iframeCheck";
    data += "&verison=" + version;
    $.ajax({
        type: 'GET',
        url: url,
        xhrFields: {
            withCredentials: true
        },
        data: data,
        success: function(data) {
            var obj = {};
            countrequests = countrequests + 1;
            if (bgisJSON(data)) {
                obj = JSON.parse(data);
                if (obj.login && obj.login === true) {
                    if (server === "us") {
                        params.isUs = true;
                        params.usZuid = obj.zuid;
                    } else if (server === "eu") {
                        params.isEu = true;
                        params.euZuid = obj.zuid;
                    } else if (server === "in") {
                        params.isIn = true;
                        params.inZuid = obj.zuid;
                    } else if (server === "au") {
                        params.isAu = true;
                        params.auZuid = obj.zuid;
                    }
                }
            }
            if (countrequests === 3) {
                setUninstallUrlAjax();
            }
        },
        error: function(data) {
            countrequests = countrequests + 1;
            if (countrequests === 3) {
                setUninstallUrlAjax();
            }
        }
    });
}

function bgmakeallajaxcall() {
    bgmakeajaxcall("us");
    bgmakeajaxcall("eu");
    bgmakeajaxcall("in");
		bgmakeajaxcall("au");
}

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            var tab = tabs[0];
            var url = tab.url;
            if (url.indexOf("www.zoho.com/social/zshare.html") === -1) {
                chrome.tabs.create({
                    'url': 'https://www.zoho.com/social/zshare.html'
                }, function(tab) {});
            }
        });
        bgmakeallajaxcall();
    } else if (details.reason === "update") {
        bgmakeallajaxcall();
    }
});

chrome.runtime.setUninstallURL(uninstallUrl);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    function executeScript() {
        if (action == 'url') {
            chrome.tabs.sendRequest(tab.id, {
                name: 'init',
                action: action,
                url: tabUrl,
                redirect: redirect
            });
        } else if (action == 'imageselection') {
            chrome.tabs.sendRequest(tab.id, {
                name: 'image',
                action: action,
                url: tabUrl,
                imageurl: imageurl,
                redirect: redirect
            });
        } else if (action == 'textimageselection') {
            chrome.tabs.sendRequest(tab.id, {
                name: 'textimage',
                action: action,
                Obj: Obj,
                redirect: redirect
            });
        } else {
            chrome.tabs.sendRequest(tab.id, {
                name: 'init',
                action: action,
                content: m_selString,
                redirect: redirect
            });
        }
    }
    var name = request.name;
    tab = sender.tab;
    switch (name) {
        case 'insert_script':
            var redirect = 'none';
            chrome.tabs.insertCSS(tab.id, {
                file: 'css/zsstyle.css'
            }, function() {});
            chrome.tabs.executeScript(tab.id, {
                file: 'js/zcontent_script.js'
            }, function() {
                executeScript();
            });
            break;
        case 'script_running':
            executeScript();
            break;
        case 'openIframe':
            action = 'imageselection';
            imageurl = request.urlinfo;
            tabUrl = tab.url;
            chrome.tabs.executeScript(tab.id, {
                file: 'js/zis_load.js'
            });
            break;
        case 'setUninstallUrl':
            var zuid = request.zuid;
            var dcType = request.redirect;
            if (dcType === "us") {
                dcType = "com";
            }
				    if (dcType === "au") {
                dcType = "com.au";
            }
            var url = uninstallUrl + '&zuid=' + zuid + '&dc=' + dcType;
            chrome.runtime.setUninstallURL(url);
            isCheckedJson.isUninstallUrlSet = true;
            isCheckedJson.zuid = zuid;
            isCheckedJson.dc = dcType;
            chrome.storage.sync.set(isCheckedJson, function() {});
            break;
        case 'isUninstallUrlSet':
            chrome.storage.sync.get(null, function(options) {
                if (options.isUninstallUrlSet === undefined || options.zuid === undefined) {
                    bgmakeallajaxcall();
                }
            });
            break;
        case 'fetchUrl':
            var server = request.domain;
            var refererUrl = request.refererUrl;
            var domain = server === "us" ? "com" : (server === "au" ? "com.au" : server);
            var url = getCheckLoginURL(domain);
            var data = "action=iframeCheck";
            data += "&verison=" + version;
            data += "&refererUrl=" + refererUrl;
            $.ajax({
                type: 'GET',
                url: url,
                xhrFields: {
                    withCredentials: true
                },
                data: data,
                success: function(data) {
                    sendResponse({
                        result: data
                    });
                },
                error: function(data) {
                    sendResponse({
                        result: 'error'
                    });
                }
            });
            return true;
            break;
    }
});
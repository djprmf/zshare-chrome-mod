//$Id: $
function serverParams(server) {
		if(server === 'au'){
				server = 'com.au';
		}
    this.serverUrl = "https://" + reachContext + "." + reachDomain + "."+server;
    this.redirect = false;
    this.zuid = '';
}
serverParams.prototype.getHomeUrl = function() {
    return this.serverUrl + "/Home.do";
};
serverParams.prototype.getUserLoginUrl = function() {
    return this.serverUrl + "/CheckUserLogin.do";
};
serverParams.prototype.getIframeUrl = function() {
    return this.serverUrl + "/socialapp.do?action=posttemplatePE&browser=";
};
serverParams.prototype.getGoogleIframeUrl = function(browser, keyword) {
    return this.serverUrl + "/socialapp.do?action=addMonitorKeyword&browser=" + browser + "&keyword=" + keyword;
};

var usParams = new serverParams("com");
var euParams = new serverParams("eu");
var inParams = new serverParams("in");
var auParams = new serverParams("au");
var currentServerUrl = usParams.serverUrl;

function clearSelection() {
    if (document.selection) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}

function getSelectionText() {
    text = '';
    if (window.getSelection) {
        text = window.getSelection().toString().trim();
        clearSelection();
    }
}

function showErrorMsg() {
    var errDiv = document.getElementById('exn_zs_error_msg');
    if (errDiv !== null) {
        $('#exn_zs_error_msg').animate({
            "opacity": "1",
            "top": "0px"
        }, 500);
    }

}

function closeErrorMsg() {
    var sErr = document.getElementById('exn_zs_error_msg');
    if (sErr !== null) {
        $('#exn_zs_error_msg').animate({
            "opacity": "0",
            "top": "-200px"
        }, {
            duration: 500,
            complete: function() {
                destroyEle('exn_zs_error_msg');
            }
        });
    }
}

function closeAnimation(id,request) {
    var ele = document.getElementById(id);
    if (ele !== null) {
        $('#' + id).animate({
            "opacity": "0",
            "top": "0px"
        }, {
            duration: 200,
            complete: function() {
                destroyEle(id);
								if(request !== undefined){
										appendLoading();	
										init(request);
								}																
            }
        });
    }
}

function closePopup() {
    closeAnimation('exn_zs_frame');
    closeAnimation('exn_zs_div');
}

function closeGooglePopup() {
    destroyEle('exn_zs_frame');
    destroyEle('exn_zs_div');
}

function closeLoading() {
    clearTimeout(clear_timeout);
    if (postMessageText !== '') {
        postMessage(postMessageText);
        postMessageText = '';
    }
    destroyEle('exn_zs_loading');
    var mainDiv = document.getElementById('exn_zs_div');
    if (mainDiv !== null) {
        mainDiv.style.display = 'block';
        mainDiv.style.opacity = '0';
    }
    var iframe = document.getElementById('exn_zs_frame');
    if (iframe !== null) {
        iframe.setAttribute('style', 'width: 100%; height: 100%; left: auto !important; position: relative; opacity: 1; top: 0px; right: 0; bottom: 0;');
        $('#exn_zs_div').animate({
            "opacity": "1"
        }, 200);
        setTimeout(function() {
            var jsonAnim = {};
            jsonAnim.animPE = "true";
            postMessage(JSON.stringify(jsonAnim));
        }, 300);
    }
    if (frameOpen == 0) {
        frameOpen = 1;
        getSuggestionImages(true);
    }
}

function getDOMImages(){
		var imgArr = [];
    var x = document.getElementsByTagName("img");
    for (var i = 0; i < x.length; i++) {
        var imgSrc = x[i].src;
        if (imgSrc.indexOf(".svg") == -1 && imgSrc.indexOf(".tif") == -1 && imgSrc.indexOf(".bmp") == -1 && imgSrc.indexOf(".webp") == -1) {
            if (imgSrc.indexOf("http") !== -1) {
                var wid = x[i].naturalWidth;
                var hei = x[i].naturalHeight;
                if (wid >= 250 && hei >= 250) {
                    if (imgArr.length === 0) {
                        imgArr.push(imgSrc);
                    } else {
                        var imgCheck = jQuery.inArray(imgSrc, imgArr);
                        if (imgCheck === -1) {
                            imgArr.push(imgSrc);
                        }
                    }
                }
            }
        }
    }
		return imgArr;
}
function getSuggestionImages(isPost) {
    var imgArr = getDOMImages();
    for (var i in imgArr) {
        if (imagesArr.length > 9) {
            break;
        }
        var imgSrc = imgArr[i];
				var imgCheck = jQuery.inArray(imgSrc, imagesArr);
				if (imgCheck === -1) {
						imagesArr.push(imgSrc);
				}
    }
    if (imagesArr.length < 9) {
        var x = document.getElementsByTagName("meta");
        for (var i = 0; i < x.length; i++) {
            if (imagesArr.length > 9) {
                break;
            }
            var metaProperty = x[i].getAttribute("property");
            if (metaProperty != null && metaProperty.toLowerCase() === "og:image") {
                var ogImage = x[i].getAttribute("content");
                ogImage = ogImage === "http://" ? null : ogImage;
                if (ogImage != null) {
                    if (ogImage.startsWith("https:https:")) {
                        ogImage = ogImage.replace("https:https:", "https:");
                    }
                    if (imagesArr.length === 0) {
                        imagesArr.push(ogImage);
                    } else {
                        var imgCheck = jQuery.inArray(ogImage, imagesArr);
                        if (imgCheck === -1) {
                            imagesArr.push(ogImage);
                        }
                    }

                }
            }
        }
    }
    if (isPost) {
        postSuggestionImages();
    }
}

function createSuggestionImageJson() {
    var jsonTxt = {};
    if (imagesArr != undefined && imagesArr.length > 0) {
        jsonTxt.suggest = true;
        for (var i = 0; i < imagesArr.length; i++) {
            var imgUrl = imagesArr[i];
            jsonTxt["suggestImg" + i] = imagesArr[i];
        }
        jsonTxt.suggestImglength = imagesArr.length;
    }else {
				jsonTxt.suggest = false;
		}
    return jsonTxt;
}

function postSuggestionImages() {
    setTimeout(function() {
        frameOpen = 0;
        var jsonTxt = createSuggestionImageJson();
        postMessage(JSON.stringify(jsonTxt));
    }, 1000);
}

function hidebk() {
    $('#exn_zs_div').addClass('_min');
}

function maxbk() {
    isSelection = getSelectionTextCheck();
    if (isSelection) {
        showbk(false);
    }
    $('#exn_zs_div').removeClass('_min');
    $('#exn_zs_div').removeClass('_bganim');
}

function hideAnimBk() {
    $('#exn_zs_div').addClass('_bganim');
}

function showbk(isMaxBkCall) {
    if (appendimage !== null && appendimage !== '') {
        var jsonText = {};
        if (appendimage.indexOf("http") === -1) {
            jsonText.appendimage_error = "error_image";
        } else {
            jsonText.appendimage = appendimage;
        }
        postMessage(JSON.stringify(jsonText));
        appendimage = '';
    } else if (text !== null && text !== '') {
        var jsonText = {};
        jsonText.append = text;
        postMessage(JSON.stringify(jsonText));
    }
    if (isMaxBkCall) {
        maxbk();
    }
}

function getChromeVersion() {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

    return raw ? parseInt(raw[2], 10) : false;
}

function postMessage(text) {
    var frame = document.getElementById("exn_zs_frame").contentWindow;
    frame.postMessage(text, currentServerUrl);
}

function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function ajaxcallresponse(data, request, server) {
    var obj = {};
    if (isJSON(data)) {
        obj = JSON.parse(data);
    }
    countParams.countrequests = countParams.countrequests + 1;
    if (server === "us") {
        usParams.redirect = true;
    }
    if (obj.login && obj.login === true) {
        if (server === "us") {
            booleanParams.us_loggedin = true;
            usParams.zuid = obj.zuid;
        } else if (server === "eu") {
            euParams.redirect = true;
            euParams.zuid = obj.zuid;
        } else if (server === "in") {
            inParams.redirect = true;
            inParams.zuid = obj.zuid;
        } else if (server === "au") {
            auParams.redirect = true;
            auParams.zuid = obj.zuid;
        }
    } else {
        countParams.countresponses = countParams.countresponses + 1;
        if (countParams.countresponses === 4 && booleanParams.us_loggedin === false && euParams.redirect === false && inParams.redirect === false && auParams.redirect === false) {						
						if (booleanParams.reAuthenticate) {
								destroyEle('exn_zs_loading');
								createerrormessage("authenticateFail");
						} else {
								requestJson = request;
								loginRedirect();
						}
        }
    }
    if ((countParams.countrequests === 4 || booleanParams.us_loggedin) && booleanParams.isLoginCheck) {
        var isLoggedIn = false;
        if (booleanParams.us_loggedin) {
            redirect = "us";
            zuid = usParams.zuid;
            isLoggedIn = true;
        } else if (usParams.redirect === true && booleanParams.us_loggedin === false && euParams.redirect === true) {
            redirect = "eu";
            zuid = euParams.zuid;
            isLoggedIn = true;
        } else if (usParams.redirect === true && booleanParams.us_loggedin === false && inParams.redirect === true) {
            redirect = "in";
            zuid = inParams.zuid;
            isLoggedIn = true;
        } else if (usParams.redirect === true && booleanParams.us_loggedin === false && auParams.redirect === true) {
            redirect = "au";
            zuid = auParams.zuid;
            isLoggedIn = true;
        }
        if (isLoggedIn) {
            booleanParams.isLoginCheck = false;
            loadFrame(request);
            chrome.runtime.sendMessage(chrome.runtime.id, {
                name: 'setUninstallUrl',
                zuid: zuid,
                redirect: redirect
            });
        }
    }
}

function makeajaxcall(request) {
    var refererUrl = window.location.href;
    if (refererUrl !== null && refererUrl !== undefined) {
        if (refererUrl.length > 500) {
            refererUrl = refererUrl.substring(0, 500);
        }
    } else {
        refererUrl = '';
    }
    refererUrl = encodeURIComponent(refererUrl);
    chrome.runtime.sendMessage({
        name: "fetchUrl",
        domain: 'us',
        refererUrl: refererUrl
    }, function(response) {
        ajaxcallresponse(response.result, request, 'us');
    });
    chrome.runtime.sendMessage({
        name: "fetchUrl",
        domain: 'eu',
        refererUrl: refererUrl
    }, function(response) {
        ajaxcallresponse(response.result, request, 'eu');
    });
    chrome.runtime.sendMessage({
        name: "fetchUrl",
        domain: 'in',
        refererUrl: refererUrl
    }, function(response) {
        ajaxcallresponse(response.result, request, 'in');
    });
    chrome.runtime.sendMessage({
        name: "fetchUrl",
        domain: 'au',
        refererUrl: refererUrl
    }, function(response) {
        ajaxcallresponse(response.result, request, 'au');
    });
}

function appendLoading() {
    var spinnerDiv = document.createElement('div');
    spinnerDiv.className = "spinnerSocialExt";
    spinnerDiv.setAttribute('style', 'z-index:9999999999; position:fixed; top:9%; left:50%; margin-left:-8px; margin-top:-5px');
    spinnerDiv.id = "exn_zs_loading";

    for (var i = 1; i <= 5; i++) {
        var rectDiv = document.createElement('div');
        var rectClassName = "rect" + i;
        rectDiv.className = rectClassName;
        spinnerDiv.appendChild(rectDiv);
    }
    var myElem = document.getElementById('exn_zs_loading');
    if (myElem === null) {
        document.body.appendChild(spinnerDiv);
    }
}

function destroyEle(id) {
    var ele = document.getElementById(id);
    if (ele !== null) {
        ele.parentNode.removeChild(ele);
    }
}

function initializeAjaxCall(request) {
    redirect = request.redirect;
    countParams.countresponses = 0;
    countParams.countrequests = 0;
    usParams = new serverParams("com");
    euParams = new serverParams("eu");
    inParams = new serverParams("in");
		auParams = new serverParams("au");
    booleanParams.us_loggedin = false;
    booleanParams.isLoginCheck = true;
    makeajaxcall(request);
}

function getSelectionTextCheck() {
    var p = document.getElementById('exn_zs_div');
    if (p !== null && p.className.indexOf('_min') > -1) {
        text = window.getSelection().toString();
        if (text !== null && text !== '') {
            clearSelection();
            return true;
        }
    }
    text = '';
    return false;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (isFunctionCalled) {
        return;
    }
    isFunctionCalled = true;
    setTimeout(function() {
        isFunctionCalled = false;
    }, 10);
    var requestAction = request.action;
    if (actionArr.indexOf(requestAction) !== -1) {
        var isSelection = false;
        if (request.action === 'selection') {
            isSelection = getSelectionTextCheck();
        }
        if (isSelection) {
            showbk(true);
        } else {
            var s = document.getElementById('exn_zs_div');
            if (s === null) {
                appendLoading();
            }
            booleanParams.reAuthenticate = false;
            destroyEle('exn_zs_error_msg');
            initializeAjaxCall(request);
        }
    }
});

function loadFrame(request) {
    switch (redirect) {
        case "us":
            currentServerUrl = usParams.serverUrl;
            break;
        case "eu":
            currentServerUrl = euParams.serverUrl;
            break;
        case "in":
            currentServerUrl = inParams.serverUrl;
            break;
        case "au":
            currentServerUrl = auParams.serverUrl;
            break;
        default:
            currentServerUrl = usParams.serverUrl;
    }
    switch (request.name) {
        case 'init':
            if (request.action === 'searchKeyword') {
                ajaxKeywordSearch(request);
                break;
            }
            countParams.shareImage = 0;
            init(request, false);
            break;
        case 'image':
            var p = document.getElementById('exn_zs_div');
            if (p !== null && p.className.indexOf('_min') > -1) {
                destroyEle('exn_zs_loading');
                if (request.imageurl) {
                    appendimage = request.imageurl;
                }
                showbk(true);
                return;
            }
            countParams.shareImage = 1;
            init(request, false);
            break;
        case 'textimage':
            istextimage = true;
            init(request, false);
            break;
    }
}

function getSharePageInfo(request) {
    var jsonobj = {};
    var titleMeta = $('meta[property="og:title"]').attr('content') || $('meta[name="title"]').attr('content') || document.title || ' ';
    var titleDOM = document.title;
    if (titleMeta !== undefined && titleMeta !== '') {
        title = titleMeta;
    } else if (titleDOM !== null && titleDOM !== undefined && titleDOM !== '') {
        title = titleDOM;
    }
    if (title !== null && title !== undefined && title !== '') {
        jsonobj.title = title;
    }
    jsonobj.link = request.url;
    description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || $('meta[name="Description"]').attr('content') || ' ';
    if (description !== null && description !== undefined && title !== '') {
        jsonobj.content = description;
    }
    var imageurls = '';
    var images = $('meta[property="og:image"]').attr("content");
    var uniqueNames = [];
    if (images != undefined && images != '') {
        uniqueNames.push(images);
        imageurls += images + ',';
    }else{
		var imgArr = getDOMImages();
				for (i = 0; i < imgArr.length; i++) {
						if (i === 5) {
            break;
        }
						images = imgArr[i];
						if ($.inArray(images, uniqueNames) === -1) {
            uniqueNames.push(images);
            imageurls += images + ',';
        }
    }
		}
    jsonobj.images = imageurls.replace(/,\s*$/, "");
    return jsonobj;
}

function construct_post_message(request) {
    var action = request.action;
    if (text == '' && countParams.shareImage !== 1) {
        if (request.url != undefined) {
            var jsonobj = {};
            jsonobj = getSharePageInfo(request);
            postMessageText = JSON.stringify(jsonobj);
        } else if (request.content != undefined) {
            var contentparam = {};
            contentparam.contentparam = '' + request.content;
            postMessageText = JSON.stringify(contentparam);
        }
    } else if (countParams.shareImage === 1) {
        var sharedimageparam = {};
        sharedimageparam = getSharePageInfo(request);
        var shareimgurl = request.imageurl;
        if (shareimgurl !== null && shareimgurl !== undefined && shareimgurl !== '') {
            sharedimageparam.sharedimageurl = shareimgurl;
        }
        postMessageText = JSON.stringify(sharedimageparam);
    } else {
        var contentparam = {};
        contentparam.contentparam = text;
        postMessageText = JSON.stringify(contentparam);
    }
}

function checkisloading(request) {
    var ele = document.getElementById('exn_zs_loading');
    if (ele !== null) {
        destroyEle('exn_zs_frame');
        destroyEle('exn_zs_div');
        destroyEle('exn_zs_loading');
        var sharedImageUrl = request.imageurl;
        if (countParams.shareImage === 1 && sharedImageUrl !== undefined && sharedImageUrl.indexOf("http") === -1) {
            createerrormessage();
        } else {
            init(request, true);
        }
    }
}

function createerrormessage(action) {
    var minMsgDiv = document.createElement('div');
    minMsgDiv.id = "exn_zs_error_msg";
    minMsgDiv.className = 'minimizeViewExtErrorMsg';
    minMsgDiv.setAttribute('style', 'position:fixed; opacity:0; top:-200px; box-sizing: inherit !important;');

    var minMsgDivInner = document.createElement('p');
    minMsgDiv.appendChild(minMsgDivInner);

    var close = document.createElement('i');
    close.className = 'zso-exclamation flExt';
    close.id = 'exn_zs_error_nortification';
    minMsgDivInner.appendChild(close);

    var spantag = document.createElement('span');
    spantag.className = 'flExt';
    spantag.style.color = '#e74c3c';
    spantag.textContent = errMsg.noSupport;
		if (action === "allowPopup") {
        spantag.textContent = errMsg.allowPopup;
    } else if (action === "authenticateFail") {
        spantag.textContent = errMsg.signIn;
    } else if (countParams.shareImage === 1) {
        spantag.textContent = errMsg.urlTooLong;
    }
    minMsgDivInner.appendChild(spantag);

    var close = document.createElement('i');
    close.className = 'zso-cancel frExt';
    close.title = 'close';
    close.id = 'exn_zs_error_close';
    minMsgDivInner.appendChild(close);

    document.body.appendChild(minMsgDiv);

    close.addEventListener("click", closeErrorMsg, false);
    showErrorMsg();
}

function browserDetection() {
    var useragent = navigator.userAgent;
    var browserdetail = useragent.toLowerCase();
    var browser = '';
    if (browserdetail.indexOf('chrome') > -1) {
        browser = 'chrome';
    } else if (browserdetail.indexOf('firefox') > -1) {
        browser = 'firefox';
    } else if (browserdetail.indexOf('safari') > -1) {
        browser = 'safari';
    } else if (browserdetail.indexOf('opera') > -1 || browserdetail.indexOf('opr') > -1) {
        browser = 'opera';
    } else {
        browser = browserdetail;
    }
    return browser;
}

function constructSharePageInfo(request, openurl) {
    openurl += "&serverURL=" + encodeURIComponent(request.url);
    if (title !== null && title !== undefined && title !== '') {
        openurl += "&title=" + encodeURIComponent(title);
    }
    if (metaimageurls !== null && metaimageurls !== undefined && metaimageurls !== '') {
        openurl += "&images_string=" + encodeURIComponent(metaimageurls);
    }
    if (description !== null && description !== undefined && description !== '') {
        openurl += "&description=" + encodeURIComponent(description);
    }
    return openurl;
}

function getOpenInNewTabUrl(request){
    getSelectionText();
    construct_post_message(request);
    var browser = browserDetection();
    var openurl = "";
    switch (redirect) {
        case "us":
            openurl = usParams.getIframeUrl() + browser;
            break;
        case "eu":
            openurl = euParams.getIframeUrl() + browser;
            break;
        case "in":
            openurl = inParams.getIframeUrl() + browser;
            break;
        case "au":
            openurl = auParams.getIframeUrl() + browser;
            break;
        default:
            openurl = usParams.getIframeUrl() + browser;
    }
    getSuggestionImages(false);
    if (text == '' && countParams.shareImage !== 1) {
        if (request.url != undefined) {
            openurl = constructSharePageInfo(request, openurl);
        } else if (request.content != undefined) {
            openurl += "&sharedtext=" + encodeURIComponent(request.content.substring(0, 1500));
        }
    } else if (countParams.shareImage === 1) {
        openurl = constructSharePageInfo(request, openurl);
        var shareimgurl = request.imageurl;
        if (shareimgurl !== null && shareimgurl !== undefined && shareimgurl !== '') {
            var arrObj = [];
            arrObj.push(shareimgurl);
            openurl += "&sharedimage=" + encodeURIComponent(JSON.stringify(arrObj));
        }
    } else {
        if (request.content != undefined && request.content != "") {
            openurl += "&sharedtext=" + encodeURIComponent(request.content.substring(0, 1500));
        } else if (text != undefined && text != "") {
            openurl += "&sharedtext=" + encodeURIComponent(text.substring(0, 1500));
        }
    }
    if (imagesArr.length > 0) {
        var i = 0;
        while (i < 5) {
            imagesArr.length = 5 - i;
            var suggestJsonText = JSON.stringify(createSuggestionImageJson());
            var count = openurl.length + suggestJsonText.length;
            if (count < 1900) {
                openurl += "&suggestionimage=" + encodeURIComponent(suggestJsonText);
                break;
            }
            i++;
        }
    }
    imagesArr = [];
    destroyEle('exn_zs_loading');
    openurl += "&newTab=true";
		return openurl;
}
function openInNewTab(request) {
		var openurl = getOpenInNewTabUrl(request);
    var w = window.open(openurl);
		if(w === null){
				createerrormessage('allowPopup');
		} else {
    w.document.title = 'zShare';
		}     
}

function initIframe(request) {
    var s = document.getElementById('exn_zs_div');
    var l = document.getElementById('exn_zs_loading');
    if (s == null) {
        var newiframe = document.createElement('iframe');
        getSelectionText();
        clearSelection();
        construct_post_message(request);
        var browser = browserDetection();
        var iframeUrl = '';
        switch (redirect) {
            case "us":
                iframeUrl = usParams.getIframeUrl() + browser;
                break;
            case "eu":
                iframeUrl = euParams.getIframeUrl() + browser;
                break;
            case "in":
                iframeUrl = inParams.getIframeUrl() + browser;
                break;
            case "au":
                iframeUrl = auParams.getIframeUrl() + browser;
                break;
            default:
                iframeUrl = usParams.getIframeUrl() + browser;
        }
        newiframe.src = iframeUrl;
        newiframe.setAttribute('frameborder', '0');
        newiframe.id = 'exn_zs_frame';

        var newdiv = document.createElement('div');
        newdiv.id = "exn_zs_div";
        newdiv.className = "exn_zs_app_open";
        newdiv.setAttribute('style', 'display:none;left:0;background-color: rgba(255, 255, 255, .8); -webkit-transition:background-color 0.2s ease-in-out 0s; transition: background-color 0.2s ease-in-out 0s;');
        newdiv.appendChild(newiframe);
        clear_timeout = setTimeout(function () { checkisloading(request); }, timeOutInMs);
        document.body.appendChild(newdiv);
    } else {
        destroyEle('exn_zs_loading');
        var json = {};
        json.closezShare = "true";
        json.request = JSON.stringify(request);
        postMessage(JSON.stringify(json));
    }
}

function init(request, isprivate) {
    isLoad = true;
    var domain = window.location.hostname;
    var sharedImageUrl = request.imageurl;
    if (CSPWhitelist.indexOf(domain) > -1 || isprivate) {
        openInNewTab(request);
        return;
    } else if (sharedImageUrl != undefined && sharedImageUrl != "" && sharedImageUrl.indexOf("http") == -1 && countParams.shareImage == 1) {
        createerrormessage();
        destroyEle('exn_zs_loading');
        return;
    }
    initIframe(request);
}

function loginRedirect() {
    var link = loginRedirectUrl + encodeURIComponent(redirect_url);
    var emptyWindow = window.open("about:blank", 'zShare_authenticate', '');
    var childWin = emptyWindow.open(link, 'zShare_authenticate', '');
    var winClosed = setInterval(function() {
        if (childWin.closed) {
            clearInterval(winClosed);
            var l = document.getElementById('exn_zs_loading');
            if (l !== null) {
                booleanParams.reAuthenticate = true;
                initializeAjaxCall(requestJson);
            } else {
                booleanParams.reAuthenticate = false;
            }
        }
    }, 250);
}

function messageReceiver(e) {
    try {
        json = JSON.parse(e.data);
        if (json.name == 'openzShare') {            
            var request = JSON.parse(json.request);
						closeAnimation('exn_zs_div',request);
        }
    } catch (error) {
        if (e.data == 'close') {
            closePopup();
        } else if (e.data == 'closeloading') { //No I18N
            closeLoading();
        } else if (e.data == 'noDefaultPortal') {
            destroyEle('exn_zs_loading');
            destroyEle('exn_zs_div');
            var w = window.open(usParams.url);
        } else if (e.data == 'hidebk') {
            hidebk();
        } else if (e.data == 'maxbk') {
            maxbk();
        } else if (e.data == 'showbk') {
            showbk(true);
        } else if (e.data == 'hideAnimBk') {
            hideAnimBk();
        } else if (e.data == 'nosocialpermission') {
            if (redirect === "eu") {
                window.location.href = euParams.getHomeUrl();
            } else if (redirect === "in") {
                window.location.href = inParams.getHomeUrl();
						} else if (redirect === "au") {
								window.location.href = auParams.getHomeUrl();
            } else {
                window.location.href = usParams.getHomeUrl();
            }
        }
    }
}
window.addEventListener("message", messageReceiver, false);
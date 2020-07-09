//$Id: $
function isValidImgFn(e) {
    image = e.target;
    var isPicTag = $(image).parent()[0].tagName.toLowerCase() === 'picture';
    if (isPicTag) {
        var $picEle = $(image).parent()[0];
        if ($($picEle).find('img').length > 0) {
            imgUrl = $($picEle).find('img')[0].currentSrc;
        } else {
            imgUrl = '';
        }
    } else {
        imgUrl = image.src;
    }
    if (imgUrl !== undefined && imgUrl !== "") {
        // Returns true if the extension matches /(jpg|jpeg|gif|png)/, or if url has no extension
        var regexImgExt = imgUrl.match(/\.([a-z]{3,4})(?:[?#:][^/]*)?$/i);
        var isValidImg = regexImgExt === null || /(jpg|jpeg|gif|png)/i.test(regexImgExt[1]);
        if (isValidImg) {
            var imgOffset = image.getBoundingClientRect();
            var width = imgOffset.width;
            var height = imgOffset.height;
            if (width >= 300 && height >= 250 && image.id !== "lb-imgObj") {
                isButtonShow = true;
                mouseinImg();
            }
        }
    }
}

function mouseinImg() {
    var buttonWidth = 80;
    var buttonHeight = 28;
    var offset = 5;
    var box = image.getBoundingClientRect();
    var width = image.width || box.width;
    var height = image.height || box.height;
    var x = window.pageXOffset + box.left + width - buttonWidth - offset;
    var y = window.pageYOffset + box.top + height - buttonHeight - offset;
    var isBodyStatic = window.getComputedStyle(document.body).getPropertyValue('position') != 'static';
    if (isBodyStatic) {
        var bodyTopOffset = document.body.getBoundingClientRect().top + window.pageYOffset;
        y -= bodyTopOffset;
    }
    iconButton.style.top = y + 'px';
    iconButton.style.left = x + 'px';
    iconButton.style.display = "block";
}

function mouseoutImg() {
    isButtonShow = false;
    iconButton.style.display = "none";
    iconButton.style.opacity = '0.9';
}

function mouseinIcon() {
    iconButton.style.opacity = '1.0';
    iconButton.style.display = 'block';
}

function mouseoutIcon() {
    mouseoutImg();
}

function scrollFn() {
    if (isButtonShow) {
        mouseinImg();
    }
}

function mousemoveFn(e) {
    if (e.target.tagName.toLowerCase() !== 'img' && e.target.id !== 'zoho_button_ext') {
        mouseoutImg();
    }
}

function openIframe() {
    chrome.runtime.sendMessage(chrome.runtime.id, {
        name: 'openIframe',
        urlinfo: imgUrl
    });
}

function appendHtml(el, str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    while (div.children.length > 0) {
        el.appendChild(div.children[0]);
    }
}

function appendIconButton() {
    iconButton = document.getElementById("zoho_button_ext");
    if (iconButton == null) {
        var zShareimgURL = chrome.extension.getURL("images/zshare.png");
        var html = '<span id="zoho_button_ext" style="display: none; position: absolute; z-index: 99999999; width: 80px; height: 31px; background-image: url(&quot;' + zShareimgURL + '&quot;); background-size: 80px 31px; opacity: 0.9; cursor: pointer; top: 0px; left: 0px;"></span>';
        appendHtml(document.body, html);
				var isAddEventListener = true;
				var domain = window.location.href;
				for(i in hideIconList){
						if(domain.indexOf(hideIconList[i]) !== -1){
								isAddEventListener = false;
						}
				}
				if(isAddEventListener){
        iconButton = document.getElementById("zoho_button_ext");
        iconButton.addEventListener('click', openIframe, false);
        $(document)
            .on('mouseenter', 'img', isValidImgFn)
            .on('mouseleave', 'img', mouseoutImg);
        $(iconButton)
            .on('mouseenter', mouseinIcon)
            .on('mouseleave', mouseoutIcon);
        window.addEventListener('scroll', scrollFn, true);
        window.addEventListener("mousemove", mousemoveFn, true);
    }
}
}

chrome.storage.sync.get(null, function(options) {
    var domain = window.location.href;
    for (var i in storageKeys) {
        var key = storageKeys[i];
        if (options[key] == undefined) {
            options[key] = true;
            chrome.storage.sync.set(options, function() {});
        }
    }
    if (!isUninstallSetCalled) {
				isUninstallSetCalled = true;				
        chrome.runtime.sendMessage(chrome.runtime.id, {
            name: 'isUninstallUrlSet'
        });
    }
    if (options.imageOverlayToggleCheck) {
				var isAppend = true;
				for(i in iconWhitelist){
						if(domain.indexOf(iconWhitelist[i]) !== -1){
								isAppend = false;
						}
				}
				if(isAppend){
						appendIconButton();	
				}        
    }
    if (window.location.href.indexOf("www.zoho.com/social/zshare.html") !== -1) {
        if ($('#zoho_button_ext').length > 0) {
            $('.webstore-button-chrome').remove();
            $('.webstore-button-opera').remove();
        }
    }
});
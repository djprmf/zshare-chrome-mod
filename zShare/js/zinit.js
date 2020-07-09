//$Id: $
var reachContext = 'social';
var reachDomain = 'zoho';
var reachServerUrl = "https://" + reachContext + "." + reachDomain + ".com";

var isAllowed = false;
var iconWhitelist = ['web.whatsapp.com', 'giphy.com'];
var hideIconList =['social.zoho.com'];
var storageKeys = ['imageOverlayToggleCheck'];

//Variables used in mouse.js
var imagesArr = [];
var frameOpen = 0;
var imgUrl = "";
var isButtonShow = false;
var image;
var iconButton;
var mutationConfig = {
    attributes: true,
    childList: true,
    subtree: true
};
var actionArr = ["selection", "imageselection", "url", "textimageselection","googletwtext"];
var icon128Url = chrome.extension.getURL("images/icon128.png");
var isUninstallSetCalled = false;

//Variables used in content_script.js
var CSPWhitelist = ['github.com', 'education.github.com', 'medium.com', 'twitter.com', 'web.whatsapp.com', 'www.npmjs.org', 'www.npmjs.com', 'mail.google.com', 'chrome.google.com', 'www.instagram.com', 'www.linkedin.com'];
var clear_timeout = null;
var timeOutInMs = 10000;
var requestJson = {};
var text = '';
var postMessageText = '';
var appendimage = '';
var title = "";
var description = "";
var imageurls = '';
var metaimageurls = '';
var isFunctionCalled = false;
var requestGoogleJson = {};
var redirect = 'us';
var service_name = 'ZohoSocial';
var redirect_url = reachServerUrl + "/addonRedirect.do";
var redirect_accountsurl = "https://accounts." + reachDomain + ".com";
var loginRedirectUrl = redirect_accountsurl + "/signin?servicename=" + service_name + "&serviceurl=";

var errMsg = {
    noSupport: "Sorry, zShare doesn\'t support sharing this page",
    signIn: "Uh oh! Looks like you're yet to sign in to Zoho Social.",
    urlTooLong: "Sorry, shared image url length is too long.Please use different image",
    allowPopup: "To continue, please enable zShare pop-ups from your browser settings.",
    googleSignIn: "Uh oh! Looks like you're yet to <a id='zShareGoogleLoginRedirect' href='javascript:;'>sign in</a> to Zoho Social.",
    googleNoPortal: "We can\'t show tweets because you haven\'t <a id='zShareGoogleLoginRedirect' href='javascript:;'>set up</a> a Brand on the Zoho Social account yet."
}
var booleanParams = {
    us_loggedin: false,
    isLoginCheck: true,
    reAuthenticate: false,
    isTwNewTab: false,
    googleReCheckLogin: false
};
var countParams = {
    shareImage: 0,
    countresponses: 0,
    countrequests: 0
};
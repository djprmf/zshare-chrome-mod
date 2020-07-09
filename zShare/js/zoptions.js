//$Id: $
function save_option() {
    var id = this.id;
    var isChecked = document.getElementById(id).checked;
    isCheckedJson[id] = isChecked;
    chrome.storage.sync.set(isCheckedJson);
}

function getStorageKeys(id) {
    chrome.storage.sync.get(id, function(options) {
        if (options[id] === undefined) {
            document.getElementById(id).checked = true;
            isCheckedJson[id] = true;
            chrome.storage.sync.set(isCheckedJson, function() {});
        } else {
            document.getElementById(id).checked = options[id];
        }
    });
}
var toggleCheckElements = document.getElementsByClassName('toggle-check'); 
var isCheckedJson = {};
chrome.storage.sync.get(null, function(items) {
    isCheckedJson = items;
});
for (let i = 0; i < toggleCheckElements.length; i++) {
    toggleCheckElements[i].addEventListener('change', save_option);
    var id = toggleCheckElements[i].id;
    getStorageKeys(id);
}
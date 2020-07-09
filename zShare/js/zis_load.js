//$Id: $
var isLoad;
if (typeof isLoad == 'undefined') {
    chrome.runtime.sendMessage(chrome.runtime.id, {
        name: 'insert_script'
    });
} else {
    chrome.runtime.sendMessage(chrome.runtime.id, {
        name: 'script_running'
    }); 
}
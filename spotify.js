chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse(true);
    console.log( request );
  });

function genericOnClick(info, tab) {
//  console.log("item " + info.menuItemId + " was clicked");
//  console.log( window.getSelection() );
//  console.log("info: " + JSON.stringify(info));
//  console.log("tab: " + JSON.stringify(tab));
}

//var id = chrome.contextMenus.create({"title": "Send Albums To Spotify", "contexts":["selection"],
//                                       "onclick": genericOnClick});
var id = chrome.contextMenus.create({"title": "Send Songs To Spotify", "contexts":["selection"],
                                       "onclick": genericOnClick});

chrome.contextMenus.onClicked.addListener(function(info, tab){
  chrome.tabs.executeScript(tab.id, {file: "get_selection.js"})
});

console.log( 'loaded' );

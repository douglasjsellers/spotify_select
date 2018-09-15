var id = chrome.contextMenus.create({"title": "Send Albums To Spotify", "contexts":["selection"],
                                       "onclick": genericOnClick});
var id = chrome.contextMenus.create({"title": "Send Songs To Spotify", "contexts":["selection"],
                                       "onclick": genericOnClick});

function genericOnClick(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
}

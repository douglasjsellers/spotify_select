function startOauth() {
  var client_id = '33cef6191c9941c9b256df2c986192c8';
  var redirectUri = chrome.identity.getRedirectURL() + "spotify";

  chrome.identity.launchWebAuthFlow({
    "url": "https://accounts.spotify.com/authorize?client_id="+client_id+
      "&redirect_uri="+ encodeURIComponent(redirectUri) + 
      "&response_type=token", 
    'interactive': true,  
  },
                                    function(redirect_url) { 
                                      console.log(redirect_url);
                                    });  
}
function searchSpotify( text ) {
  console.log( "Searching spotify for " + text );
  var xhr = new XMLHttpRequest();
  
  xhr.onreadystatechange = function() {
    if( this.readyState == 4 )
    {
      console.log( JSON.parse( this.responseText ) );
    }
  }
  xhr.open("GET", "https://api.spotify.com/v1/search?type=album,track&q=" + text, true);
  xhr.setRequestHeader( 'Authorization', 'Bearer BQAbb8m6XKx6zJ0-PKPuzEI8fodSduoJSwyb5fYiKwnTUvvZymXfhz5G4Y1lcybnnAobsabadAsX_4Ao0i7O4VRjhar9sSjoORbLrCXgCeaoL7RSG7YMQtoy-fQi0ZDIQaBJ8eCxOGeL6lH8k3eILxob16pJWmHnw46bbYMIYYhXVhhmwPUO7wPFj8fBFHXOxPUG_Uei5KcrDTvIR-pVrSFaWGMSnJMC4hQsipQ5KbjSe6txakyUUAZMqMFMwCWxuKpFQsjbGj1cahC5dVjYtSGAgQ' )
  
  xhr.send();  
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse(true);
    console.log( request );
    searchSpotify( request.selection[0] );
  });
function genericOnClick(info, tab) {}
var id = chrome.contextMenus.create({"title": "Send Albums To Spotify", "contexts":["selection"],
                                       "onclick": genericOnClick});
var id = chrome.contextMenus.create({"title": "Send Songs To Spotify", "contexts":["selection"],
                                       "onclick": genericOnClick});
chrome.contextMenus.onClicked.addListener(function(info, tab){
  chrome.tabs.executeScript(tab.id, {file: "get_selection.js"})
});
console.log( 'loaded' );

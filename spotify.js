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

function refresh_token( spotify_auth, function_to_call ) {
  console.log( 'refreshing token' );
  var client_id = '33cef6191c9941c9b256df2c986192c8';
  var client_secret = '556031aed9c741a887bdeaf02a95b357';
  
  var req = new XMLHttpRequest();
  req.open("POST", "https://accounts.spotify.com/api/token", true);
  req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  req.setRequestHeader("Authorization", "Basic " + btoa( client_id + ":" + client_secret ));
  req.onreadystatechange = function() {//Call a function when the state changes.
    if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      var value = JSON.parse(this.response);
      var internal_function = function_to_call;
      spotify_auth['access_token'] = value['access_token']
      spotify_auth['start_time'] = new Date().getTime() / 1000;
      console.log( value );
      chrome.storage.local.set( {'spotify_auth':spotify_auth}, function() {
        internal_function( spotify_auth['access_token'] );
      });
    }
  }                                      
  req.send("grant_type=refresh_token&refresh_token="+ encodeURIComponent(spotify_auth['refresh_token']));
  
}

function fetchSpotifyAuthorizationToken( function_to_call ) {
  chrome.storage.local.get( ['spotify_auth'], function( value ) {
    var internal_function = function_to_call;
    var spotify_auth = value['spotify_auth'];
    var current_time = new Date().getTime() / 1000;
    console.log( "current time = " + current_time );
    console.log( "expiration time = " + spotify_auth['start_time'] + spotify_auth['expires_in'] );
    if( current_time > spotify_auth['start_time'] + spotify_auth['expires_in'] ) {
      refresh_token( spotify_auth, internal_function );
    } else
    {
      internal_function( spotify_auth['access_token'] );
    }
  });
  
}

function searchSpotify( text ) {
  console.log( "Searching spotify for " + text );
  fetchSpotifyAuthorizationToken( function( token ) {
    var xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
      if( this.readyState == 4 )
      {
        console.log( JSON.parse( this.responseText ) );
      }
    }
    xhr.open("GET", "https://api.spotify.com/v1/search?type=album,track&q=" + text, true);
    xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )
    
    xhr.send();  
    
  } );
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

class Selection {
  constructor( lines ) {
    this.queue = lines;
    this.current_position = 0;
    this.results = [];
  }

  hasMore() {
    return this.current_position < this.queue.length;
  }
  
  next() {
    var to_return = this.queue[this.current_position];
    this.current_position = this.current_position + 1;
    return to_return;
  }

  addResult( result ) {
    this.results.push( result );
  }
}

class SpotifyGetRequest {
  constructor( url ) {
    this.url = url;
  }

  results( call_back ) {
    var urlToCall = this.url;
    
    fetchSpotifyAuthorizationToken( function( token ) {
      var xhr = new XMLHttpRequest();
      
      xhr.onreadystatechange = function() {
        if( this.readyState == 4 )
        {
          call_back( this.responseText );
        }
      }
      xhr.open("GET", "https://api.spotify.com" + urlToCall, true);
      xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )
      xhr.send();  
    } );
    
  }
}
  
class SpotifySearch {
  constructor( text ) {
    this.text = text
  }

  results( results_call_back ) {
    var textSearch = this.text;
    var getRequest = new SpotifyGetRequest( "/v1/search?type=track&q=" + textSearch );
    getRequest.results( function ( responseText ) {
      var json = JSON.parse( responseText );
      var track = json['tracks']['items'][0];
      results_call_back( track );
    } );
  }
}

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
    if( current_time > spotify_auth['start_time'] + spotify_auth['expires_in'] ) {
      refresh_token( spotify_auth, internal_function );
    } else
    {
      internal_function( spotify_auth['access_token'] );
    }
  });
  
}


function createPlaylist( function_to_run_on_success ) {
  fetchSpotifyAuthorizationToken( function( token ) {  
    var xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
      if( this.readyState == 4 && ( this.status >= 200 || this.status <= 299 ) )
      {

        var json = JSON.parse( this.responseText );
        console.log( json );
        var playlistId = json['id'];
        function_to_run_on_success( playlistId );
      }
    }
    xhr.open("POST", "https://api.spotify.com/v1/me/playlists" , true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )    
    xhr.send(JSON.stringify({ name: "Select2Spotify", public: false }));
  } );
  
}

function findOrCreatePlaylist( function_to_run_on_success ) {
  fetchSpotifyAuthorizationToken( function( token ) {  
    var xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
      if( this.readyState == 4 && ( this.status >= 200 || this.status <= 299 ) )
      {

        var json = JSON.parse( this.responseText );
        var playlists = json['items'];
        var i = 0;
        var playlistId = null;
        for( i = 0; i < playlists.length; i++ )
        {
          if( playlists[i].name == 'Select2Spotify' )
          {
            playlistId = playlists[i].id
          }
        }

        if( playlistId != null )
        {
          function_to_run_on_success( playlistId );
        } else
        {
          createPlaylist( function_to_run_on_success );
        }
      }
    }
    xhr.open("GET", "https://api.spotify.com/v1/me/playlists" , true);
    xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )
    xhr.send();
  } );
}
  

function addTrackToPlaylist( track ) {
  console.log( 'adding track ' );
  console.log( track );
  findOrCreatePlaylist( function (playlistid )
                        {
                          fetchSpotifyAuthorizationToken( function( token ) {
                          
                            var xhr = new XMLHttpRequest();
                            xhr.onreadystatechange = function() {
                              if( this.readyState == 4 && ( this.status >= 200 || this.status <= 299 ) )
                              {

                                var json = JSON.parse( this.responseText );
                                console.log( 'created track' );
                                console.log( json );
                              }
                            }
                            xhr.open("POST", "https://api.spotify.com/v1/playlists/" + playlistid + "/tracks" , true);
                            xhr.setRequestHeader("Content-Type", "application/json");
                            xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )    
                            xhr.send(JSON.stringify({ uris: [track.uri] }));
                          })
                        } );
  
}

function searchSpotify( text ) {
  console.log( "Searching spotify for " + text );
  fetchSpotifyAuthorizationToken( function( token ) {
    var xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
      if( this.readyState == 4 )
      {
        var json = JSON.parse( this.responseText );
        var track = json['tracks']['items'][0];
        addTrackToPlaylist( track );
        
      }
    }
    xhr.open("GET", "https://api.spotify.com/v1/search?type=track&q=" + text, true);
    xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )
    xhr.send();  
    
  } );
}

function tryToCleanText( text ) {
  return text.replace(/^[^a-zA-Z0-9]*[0-9]+[.]?/gi, '');  
}

function performSearch( selection, textToSearch, retried ) {
  console.log( "Searching for " + textToSearch );
  var spotifySearch = new SpotifySearch( textToSearch );
  spotifySearch.results( function( track )
                         {
                           if( track )
                           {
                             console.log( track.uri );
                             selection.addResult( track.uri );        
                           } else if( !retried )
                           {
                             performSearch( selection, tryToCleanText( textToSearch ), true );
                           }
                           else
                           {
                             console.log( "can't find ");
                           }
                           processSelection( selection );
                         } ); 
}

function processSelection( selection ) {
  if( selection.hasMore() )
  {
    performSearch( selection, selection.next(), false );
  } else
  {
    console.log( "done processing" );
  }
    
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse(true);
    console.log( request );
    //    searchSpotify( request.selection[0] );
    var selection = new Selection( request.selection );
    processSelection( selection );
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

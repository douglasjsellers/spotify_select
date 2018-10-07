
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
                                    });  
}

function refresh_token( spotify_auth, function_to_call ) {
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

  

function addTrackToPlaylist( track ) {
  findOrCreatePlaylist( function (playlistid )
                        {
                          fetchSpotifyAuthorizationToken( function( token ) {
                          
                            var xhr = new XMLHttpRequest();
                            xhr.onreadystatechange = function() {
                              if( this.readyState == 4 && ( this.status >= 200 || this.status <= 299 ) )
                              {

                                var json = JSON.parse( this.responseText );
                              }
                            }
                            xhr.open("POST", "https://api.spotify.com/v1/playlists/" + playlistid + "/tracks" , true);
                            xhr.setRequestHeader("Content-Type", "application/json");
                            xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )    
                            xhr.send(JSON.stringify({ uris: [track.uri] }));
                          })
                        } );
  
}


function tryToCleanText( text ) {
  return text.replace(/^[^a-zA-Z0-9]*[0-9]+[.]?/gi, '');  
}

function performSearch( selection, textToSearch, retried ) {
  var spotifySearch = new SpotifySearch( textToSearch );
  spotifySearch.results( function( track )
                         {
                           if( track )
                           {
                             selection.addResult( track.uri );
                             addSelectionToPlaylist( selection );                             
                           } else if( !retried )
                           {
                             performSearch( selection, tryToCleanText( textToSearch ), true );
                           }
                           else
                           {
                             console.log( "can't find ");
                             addSelectionToPlaylist( selection );                             
                           }

                         } ); 
}

function addToPlaylist( selection ) {
  var playlist = new Playlist( "Spotify Select" );
  playlist.findOrCreate( function( playlist_id )
                         {
                           var add = new AddTracksToPlaylist( playlist_id );
                           add.request( selection.getResults(), function()
                                        {
                                        } );
                             
                         } );
}

function addSelectionToPlaylist( selection ) {
  if( selection.hasMore() )
  {
    performSearch( selection, selection.next(), false );
  } else
  {
    addToPlaylist( selection );
  }
    
}

function playTrack( track )
{
  var putRequest = new SpotifyPutRequest( "/v1/me/player/play", {uris:[track.uri]} );
  putRequest.results( function( responseText)
                      {
                        console.log( "Playing Track" );
                      } );
  
}

function findAndPlaySelectedSong( textToSearchFor, retried )
{
  var spotifySearch = new SpotifySearch( textToSearchFor );
  spotifySearch.results( function( track )
                         {
                           if( track )
                           {
                             playTrack( track );
                           } else if( !retried )
                           {
                             findAndPlaySelectedSong(  tryToCleanText( textToSearchFor ), true );
                           }
                           else
                           {
                             console.log( "can't find ");
                           }

                         } ); 
  
}

var actionForSelection = null;

function sendSongsToPlaylist(info, tab)
{
  actionForSelection =  info.menuItemId;
  chrome.tabs.executeScript(tab.id, {file: "get_selection.js"})  
}

function playSong( info, tab )
{
  actionForSelection =  info.menuItemId;  
  chrome.tabs.executeScript(tab.id, {file: "get_selection.js"})  
  
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse)
  {
    sendResponse(true);
    var selection = new Selection( request.selection );
    if( actionForSelection == "play_song" )
    {
      findAndPlaySelectedSong( selection.next() );      
    } else if( actionForSelection == "add_to_playlist" )
    {
      addSelectionToPlaylist( selection );      
    }
    actionForSelection = null;

  });

var playsong_id = chrome.contextMenus.create(
  {
    "title": "Play highlighted Song",
    "id": "play_song",
    "contexts":["selection"],
    "onclick": playSong
  }
);

var id = chrome.contextMenus.create(
  {
    "title": "Send List of Songs To Spotify Playlist",
    "id" : "add_to_playlist",
    "contexts":["selection"],
    "onclick": sendSongsToPlaylist
  } );

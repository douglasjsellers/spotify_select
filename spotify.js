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

  getResults()
  {
    return this.results;
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

class SpotifyPutRequest
{
  constructor( url, data ) {
    this.url = url;
    this.data = data
  }
  
  results( callback )
  {
    var xhr = new XMLHttpRequest();
    var urlToCall = this.url;
    var dataToUse = this.data
    fetchSpotifyAuthorizationToken( function( token ) {
      xhr.onreadystatechange = function() {
        if( this.readyState == 4 && ( this.status >= 200 || this.status <= 299 ) )
        {
          callback( this.responseText );
        }
      }
      xhr.open("PUT", "https://api.spotify.com" + urlToCall , true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )
      console.log( dataToUse );
      xhr.send(JSON.stringify(dataToUse));
      
    } );    
  }
}

class SpotifyPostRequest
{
  constructor( url, data ) {
    this.url = url;
    this.data = data
  }
  
  results( callback )
  {
    var xhr = new XMLHttpRequest();
    var urlToCall = this.url;
    var dataToUse = this.data
    fetchSpotifyAuthorizationToken( function( token ) {
      xhr.onreadystatechange = function() {
        if( this.readyState == 4 && ( this.status >= 200 || this.status <= 299 ) )
        {
          callback( this.responseText );
        }
      }
      xhr.open("POST", "https://api.spotify.com" + urlToCall , true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )    
      xhr.send(JSON.stringify( dataToUse ));
      
    } );    
  }
}

class SpotifySearch
{
  constructor( text )
  {
    this.text = text
  }

  results( results_call_back )
  {
    var textSearch = this.text;
    var getRequest = new SpotifyGetRequest( "/v1/search?type=track&q=" + textSearch );
    getRequest.results( function ( responseText ) {
      var json = JSON.parse( responseText );
      var track = json['tracks']['items'][0];
      results_call_back( track );
    } );
  }
}

class AddTracksToPlaylist
{
  constructor( playlist_id )
  {
    this.playlist_id = playlist_id;
  }
  
  request( uris, success_function )
  {
    console.log( uris );
    var postRequest = new SpotifyPostRequest( "/v1/playlists/" + this.playlist_id + "/tracks", { uris: uris } );
    postRequest.results( function ( responseText )
                         {
                           success_function();
                         } );
  }
}
class CreatePlaylist
{
  constructor( playlist_name )
  {
    this.name = playlist_name;
  }

  results( success_function )
  {
    var playlist_name = this.name;
    
    var postRequest = new SpotifyPostRequest( "/v1/me/playlists", { name: "Spotify Select", public: false } );
    postRequest.results( function ( responseText ) {
      var json = JSON.parse( responseText );
      console.log( json );
      var playlistId = json['id'];
      success_function( playlistId );
    } );
  }
  
}

class FindPlaylist
{
  constructor( playlist_name )
  {
    this.name = playlist_name;
  }

  results( found, failed )
  {
    var playlist_name = this.name;
    var getRequest = new SpotifyGetRequest( "/v1/me/playlists" );
    getRequest.results( function ( responseText ) {
      var json = JSON.parse( responseText );
      var playlist = json['items'].find( function( playlist ) { return playlist.name == playlist_name } );
      playlist != null ? found( playlist['id'] ) : failed();
    } );

  }
}

class Playlist
{
  constructor( playlist_name )
  {
    this.name = playlist_name;
  }

  findOrCreate( success_function )
  {
    var playlistFinder = new FindPlaylist( this.name );
    var playlistName = this.name;
    playlistFinder.results( function( playlist_id )
                            {
                              success_function( playlist_id );
                            },
                            function()
                            {
                              var playlistCreator = new CreatePlaylist( playlistName );
                              playlistCreator.results( success_function );
                            }
                          );

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
p
                           var add = new AddTracksToPlaylist( playlist_id );
                           add.request( selection.getResults(), function()
                                        {
                                          console.log( 'tracks added' );
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
                        console.log( responseText );
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
                             findAndPlaySelectedSong( selection, tryToCleanText( textToSearch ), true );
                           }
                           else
                           {
                             console.log( "can't find ");
                           }

                         } ); 
  
}

function sendSongsToPlaylist(info, tab)
{
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse)
    {
      sendResponse(true);
      var selection = new Selection( request.selection );
      addSelectionToPlaylist( selection );
    });
  chrome.tabs.executeScript(tab.id, {file: "get_selection.js"})  
}

function playSong( info, tab )
{
  console.log( 'playing song' );
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse)
    {
      sendResponse(true);
      var selection = new Selection( request.selection );
      findAndPlaySelectedSong( selection );
    });
  chrome.tabs.executeScript(tab.id, {file: "get_selection.js"})  
  
}

var id = chrome.contextMenus.create(
  {
    "title": "Send List of Songs To Spotify Playlist",
    "contexts":["selection"],
    "onclick": sendSongsToPlaylist
  } );
var playsong_id = chrome.contextMenus.create(
  {
    "title": "Play highlighted Song",
    "contexts":["selection"],
    "onclick": playSong
  }
);

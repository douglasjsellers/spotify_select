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

function playAlbum( album )
{
  var putRequest = new SpotifyPutRequest( "/v1/me/player/play", {context_uri:album.uri} );
  putRequest.results( function( responseText)
                      {
                        console.log( "Playing Album" );
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

function findAndPlaySelectedAlbum( textToSearchFor, retried )
{
  var spotifySearch = new SpotifySearch( textToSearchFor, "album" );
  spotifySearch.results( function( album )
                         {
                           if( album )
                           {
                             playAlbum( album );
                           } else if( !retried )
                           {
                             findAndPlaySelectedAlbum(  tryToCleanText( textToSearchFor ), true );
                           }
                           else
                           {
                             console.log( "can't find ");
                           }

                         } ); 
  
}

var actionForSelection = null;

function genericClickHandler( info, tab )
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
    } else if( actionForSelection == "play_album" )
    {
      findAndPlaySelectedAlbum( selection.next() );      
    }
    actionForSelection = null;

  });


var playsong_id = chrome.contextMenus.create(
  {
    "title": "Play Highlighted Song",
    "id": "play_song",
    "contexts":["selection"],
    "onclick": genericClickHandler
  }
);

var play_albumn = chrome.contextMenus.create(
  {
    "title": "Play Highlight Album",
    "id" : "play_album",
    "contexts":["selection"],
    "onclick": genericClickHandler
  } );

var id = chrome.contextMenus.create(
  {
    "title": "Send Highlighted Songs To Spotify Playlist",
    "id" : "add_to_playlist",
    "contexts":["selection"],
    "onclick": genericClickHandler
  } );


class SpotifyGetRequest {
  constructor( url, variables ) {
    this.variables = variables || null
    this.url = url;
  }

  results( call_back ) {
    var urlToCall = this.url;
    var variables = this.variables;
    
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
      if( variables )
      {
        xhr.send( variables );
      } else
      {
        xhr.send();
      }
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
  constructor( text, type )
  {
    this.type = type || "track"
    this.text = text;
  }

  results( results_call_back )
  {
    var textSearch = this.text;
    var typeSearch = this.type;
    var getRequest = new SpotifyGetRequest( "/v1/search?type=" + this.type + "&q=" + textSearch );
    getRequest.results( function ( responseText ) {
      var json = JSON.parse( responseText );
      var track = json[typeSearch + 's']['items'][0];
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
      var playlistId = json['id'];
      success_function( playlistId );
    } );
  }
  
}

class AlbumTrackList
{
  constructor( album_id )
  {
    this.album_id = album_id;
  }

  results( success_function )
  {
    var getRequest = new SpotifyGetRequest( "/v1/albums/" + this.album_id + "/tracks" );
    getRequest.results( function ( responseText ) {
      var json = JSON.parse( responseText );
      success_function( json['items'] );
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

class DetailedTrackList
{
  constructor( track_ids )
  {
    this.track_ids = track_ids;
  }

  results( success_function )
  {
    var getRequest = new SpotifyGetRequest( "/v1/tracks?ids=" + this.track_ids.join(",") );
    getRequest.results( function ( responseText ) {
      var json = JSON.parse( responseText );
      success_function( json['tracks'] );
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

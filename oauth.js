function startSpotifyOAuth( success_function ) {
  var client_id = '33cef6191c9941c9b256df2c986192c8';
  var client_secret = '556031aed9c741a887bdeaf02a95b357';
  var redirectUri = chrome.identity.getRedirectURL("spotify") ;
  var success_function_one = success_function;
  chrome.identity.launchWebAuthFlow({
    "url": "https://accounts.spotify.com/authorize?client_id="+client_id+
      "&redirect_uri="+ encodeURIComponent(redirectUri) + 
      "&response_type=code&scope=app-remote-control%20playlist-read-private%20playlist-modify-private%20playlist-modify-public%20user-library-read%20playlist-modify%20user-modify-playback-state", 
    'interactive': true,  
  },
                                    function(redirect_url)
                                    {
                                      var parsedParameters = {}
                                      var queryString = redirect_url.split( "?" )[1];
                                      var queryParameters = queryString.split("&");
                                      var success_function_two = success_function_one;
                                      for (var parameterNumber in queryParameters) {
                                        var parameter = queryParameters[parameterNumber];
                                        var name = parameter.split( "=" )[0];
                                        var value = decodeURIComponent( parameter.split( "=" )[1] );
                                        parsedParameters[name] = value;
                                      }
                                      var code = parsedParameters['code'];
                                      var req = new XMLHttpRequest();
                                      req.open("POST", "https://accounts.spotify.com/api/token", true);
                                      req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                                      req.setRequestHeader("Authorization", "Basic " + btoa( client_id + ":" + client_secret ));
                                      req.onreadystatechange = function()
                                      {
                                        if(this.readyState == XMLHttpRequest.DONE && this.status == 200)
                                        {
                                          var value = JSON.parse(this.response);
                                          value['start_time'] = new Date().getTime() / 1000;
                                          chrome.storage.local.set( {'spotify_auth':value}, function()
                                                                    {
                                                                      success_function_two();
                                                                    });
                                        }
                                      }                                      
                                      req.send("grant_type=authorization_code&code="+ encodeURIComponent(code) + "&redirect_uri=" + encodeURIComponent(redirectUri));
                                    });  
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
  var call_back_function = function_to_call;
  chrome.storage.local.get( ['spotify_auth'], function( value ) {
    if( value['spotify_auth'] )
    {
      var internal_function = function_to_call;
      var spotify_auth = value['spotify_auth'];
      var current_time = new Date().getTime() / 1000;
      if( current_time > spotify_auth['start_time'] + spotify_auth['expires_in'] ) {
        refresh_token( spotify_auth, internal_function );
      } else
      {
        internal_function( spotify_auth['access_token'] );
      }
    } else
    {
      startSpotifyOAuth( function()
                         {
                           fetchSpotifyAuthorizationToken( call_back_function );
                         });
    }
  });
  
}


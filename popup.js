function startSpotifyOAuth() {
  var client_id = '33cef6191c9941c9b256df2c986192c8';
  var client_secret = '556031aed9c741a887bdeaf02a95b357';
  var redirectUri = chrome.identity.getRedirectURL("spotify") ;
  chrome.identity.launchWebAuthFlow({
    "url": "https://accounts.spotify.com/authorize?client_id="+client_id+
      "&redirect_uri="+ encodeURIComponent(redirectUri) + 
      "&response_type=code&scope=app-remote-control", 
    'interactive': true,  
  },
                                    function(redirect_url)
                                    {
                                      console.log(redirect_url);
                                      var parsedParameters = {}
                                      var queryString = redirect_url.split( "?" )[1];
                                      var queryParameters = queryString.split("&");
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
                                      req.onreadystatechange = function() {//Call a function when the state changes.
                                        if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                                          var value = JSON.parse(this.response);
                                          chrome.storage.local.set( {'spotify_auth':value}, function() {
                                            console.log( 'spotify_auth set to ' );
                                            console.log( value );
                                          });
                                        }
                                      }                                      
                                      req.send("grant_type=authorization_code&code="+ encodeURIComponent(code) + "&redirect_uri=" + encodeURIComponent(redirectUri));
                                    });  
}

document.getElementById("clickme").addEventListener("click", function(){
  console.log( 'launching' );  
  startSpotifyOAuth();
});
console.log( "adding listener" );

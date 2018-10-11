# Spotify Select
A Chrome extension that allows you to highlight text on a web page, right click, and then send that text to Spotify in a variety of different ways.  This was created to satisfy my own problem of getting songs from the /r/metal subreddit into Spotify.  This extension makes taking songs and albums from a web page and get them in Spotify.

When a user right clicks they will have the following options:

## Spotify Select -> Play Highlighted Song
This option takes the first line of highlighted text from the web page, searches for it on Spotify, and plays the resulting song in the last version of Spotify (mobile, web, desktop) that the user last played a song in.  If nothing can be found then nothing is played.  If only an album is found, then nothing will be played.
        
![Play Highlighted Song](https://raw.githubusercontent.com/douglasjsellers/spotify_select/master/gifs/play_song.gif)
        
## Spotify Select -> Play Highlighted Album
This option takes the first line of highlighted text from the web page, searches for it on Spotify, and plays the resulting album (starting with the first song) in the last version of Spotify (mobile, web, desktop) that the user last played a song in.  If nothing can be found then nothing is played.  If only an song is found but no album, then nothing will be played.

![Play Album](https://raw.githubusercontent.com/douglasjsellers/spotify_select/master/gifs/play_album.gif)
        
## Spotify Select -> Play Most Popular Song On Highlighted Album
This option takes the first line of highlighted text on the web page, searches for it on Spotify, loads all of the details of the tracks on the album and then plays the most popluar song on the album (as designated by Spotify's popularity algorithm).  If no album can be found, then nothing is played.
        
![Play Most Popular Song](https://raw.githubusercontent.com/douglasjsellers/spotify_select/master/gifs/play_most_popular_song.gif)

## Spotify Select -> Send Highlighted List of Songs To Spotify Playlist
This option is used to take a highlighted list of songs off of a web page and add those songs into a playlist in Spotify.  The way that the list is divided is on a line by line basis.  Each line is assumed to represent a single song.  The playlist that these songs will be added to is called "Spotify Select".  If no such playlist exists, that playlist will be created.  Nothing is autoplayed.

![Play Highlighted List of Songs](https://raw.githubusercontent.com/douglasjsellers/spotify_select/master/gifs/send_highlighted_song_to_playlist.gif)
        

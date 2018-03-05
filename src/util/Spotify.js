const clientId = '';
const redirectURI = 'http://localhost:3000';
const scope = 'playlist-modify-public';

let accessToken = '';

const Spotify = {
  getAccessToken() {
    console.log('Get Access Token');

    // Check if access token is already set
    if (accessToken !== '') {
      return accessToken;
    }

    // Check if we have just obtained it
    let str = window.location.href;
    let token = str.match(/access_token=([^&]*)/);
    if (token) {
      accessToken = token[1];
      console.log('Access token: ' + accessToken);
      let expiresIn = str.match(/expires_in=([^&]*)/);
      expiresIn = expiresIn[1];
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      // Get access token from Spotify
      let url = 'https://accounts.spotify.com/authorize?client_id=' + clientId + '&response_type=token&redirect_uri=' + redirectURI + '&scope=' + scope;
      console.log('Redirecting to: ' + url);
      window.location.replace(url);
      return '';
    }
  },

  // Search for tracks on Spotify using the given search term
  async search(term) {

    console.log('Search with term: ' + term);

    let url = 'https://api.spotify.com/v1/search?type=TRACK&q=' + term;
    try {
      await Spotify.getAccessToken();
      let response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.ok) {
        let jsonResponse = await response.json();
        return jsonResponse.tracks.items.map(track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }
        });
      } else {
        console.log('Search response not ok');
      }
    } catch(error) {
      console.log(error);
    }
  },

  // Create a new playlist for current user on Spotify
  async savePlaylist(name, uris) {

    console.log('savePlaylist');

    let userId = '';
    let playlistId = '';
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-type': 'application/json'
    }

    // validate inputs
    if (name === '' || uris === []) {
      console.log('Playlist name or uris are empty');
      return;
    }

    // get user id
    try {
      let response = await fetch('https://api.spotify.com/v1/me', {
        headers: headers
      });
      if (response.ok) {
        let jsonResponse = await response.json();
        userId = jsonResponse.id;
        if (userId === '') {
          return;
        }
        console.log('Successfully retrieve users id: ' + userId);
      } else {
        console.log('Failed to retrieve user id')
      }
    } catch(error) {
      console.log('Request failed to get user id');
    }

    // post new playlist (returns playlist id)
    let playlist_data = {
      name: name,
    }
    try {
      let response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(playlist_data)
      });
      if (response.ok) {
        let jsonResponse = await response.json();
        playlistId = jsonResponse.id;
        if (playlistId === '') {
          console.log('Unable to retrieve playlist id');
          return;
        }
        console.log('Playlist id: ' + playlistId);
      } else {
        console.log('Failed to create playlist');
      }
    } catch(error) {
      console.log('Request failed to create playlist');
    }

    // post tracks to playlist
    let track_data = {
      uris: uris
    }
    try {
      let response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(track_data)
      });
      if (response.ok) {
        console.log('Successfully added tracks');
      } else {
        console.log('Failed to add tracks');
      }
    } catch (error) {
      console.log('Request failed to add tracks');
    }
  }
}

export default Spotify;

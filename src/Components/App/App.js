import './App.css';
import React, { Component } from 'react';
import SearchBar from '../SearchBar/SearchBar.js';
import SearchResults from '../SearchResults/SearchResults.js';
import Playlist from '../Playlist/Playlist.js';
import Spotify from '../../util/Spotify.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: []
    };
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.changeName = this.changeName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    let playlist = this.state.playlistTracks;
    let found = playlist.find(song => {
      return song.id === track.id
    });
    if (!found) {
      playlist.push(track);
      this.setState({
        playlistTracks: playlist
      });
    }
    return;
  }

  removeTrack(track) {
    let playlist = this.state.playlistTracks;
    playlist = playlist.filter(song => {
      return song.id !== track.id;
    });
    this.setState({
      playlistTracks: playlist
    });
    return;
  }

  changeName(name) {
    this.setState({
      playlistName: name
    });
  }

  async savePlaylist() {
    let trackURIs = this.state.playlistTracks.map(track => {
      return track.uri;
    });
    await Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.setState({
      playlistName: 'New Playlist',
      playlistTracks: [],
      searchResults: []
    })
  }

  async search(term) {
    let results = await Spotify.search(term);
    this.setState({
      searchResults: results
    });
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search}/>
          <div className="App-playlist">
            <SearchResults
              results={this.state.searchResults}
              onAdd={this.addTrack}/>
            <Playlist
              name={this.state.playlistName}
              playlist={this.state.playlistTracks}
              onRemove={this.removeTrack}
              onNameChange={this.changeName}
              onSave={this.savePlaylist}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

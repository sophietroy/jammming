import './SearchBar.css';
import React from 'react';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch() {
    let value = document.getElementById('search-box').value;
    this.props.onSearch(value);
  }

  render() {
    return (
      <div className="SearchBar">
        <input id='search-box' placeholder="Enter A Song, Album, or Artist" />
        <a onClick={this.handleSearch}>SEARCH</a>
      </div>
    )
  }
}

export default SearchBar;

import React, { useState } from 'react';

const SearchBar = ({ keyword, setKeyword, onSearch }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyPress={handleKeyPress}
        className="search-input"
      />
      <button className="search-button" onClick={onSearch}>🔍</button>
    </div>
  );
};

export default SearchBar;

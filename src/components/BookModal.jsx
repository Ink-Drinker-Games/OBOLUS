import React, { useState } from 'react';
import frameImage from '../assets/coinmodal_frame.webp';

// Change prop from coinName to coin to match your App.jsx
export default function BookModal({ coin, onSelect, onClose }) {
  const [url, setUrl] = useState('');

  // Helper logic using coin.name
  const coinNameLower = coin?.name?.toLowerCase() || "";
  const needsArticle = ["wound", "heart", "forge", "mirror", "balance"]; 
  const displayName = needsArticle.includes(coinNameLower) ? `The ${coin.name}` : coin.name;

  const handleInscribe = () => {
    if (url) {
      onSelect(coin.id, url); // Pass coin.id back to handleBookSelect
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content book-modal" 
        style={{ backgroundImage: `url(${frameImage})` }} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">
          <span className="title-top">Inscribe the Ledger</span>
          <span className="title-bottom">The Coin of {displayName}</span>
        </h2>

        <div className="inscription-container">
          <input 
            className="book-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInscribe()}
            placeholder="Paste cover image link here..."
            autoFocus
          />
          <button className="inscribe-button" onClick={handleInscribe}>
            Inscribe
          </button>
        </div>

        <p className="inscription-hint">
          Right-click a cover on StoryGraph or Goodreads and "Copy Image Address"
        </p>

        <button className="clear-button" onClick={() => { onSelect(coin.id, null); onClose(); }}>
          Remove This Book
        </button>
      </div>
    </div>
  );
}
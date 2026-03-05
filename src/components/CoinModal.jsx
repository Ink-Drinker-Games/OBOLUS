import React from 'react';
import frameImage from '../assets/coinmodal_frame.webp';

export default function CoinModal({ coin, onSelect, onClear, onClose }) {
  if (!coin) return null;

  const getCoinImg = (sideName) => {
    const fileName = `${coin.id}_coin_of_${coin.name}_${sideName.toLowerCase()}.webp`;
    return new URL(`../assets/${fileName}`, import.meta.url).href;
  };

  const handlePick = (imgUrl) => {
    onSelect(coin.id, imgUrl);
    onClose();
  };

  // Logic for "The Heart", "The Forge", etc.
  const needsArticle = ["wound", "heart", "forge", "relic", "bond", "mirage"];
  const displayName = needsArticle.includes(coin.name) ? `The ${coin.name}` : coin.name;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ backgroundImage: `url(${frameImage})` }} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">
          <span className="title-top">Choose Your Path</span>
          <span className="title-bottom">The Coin of {displayName}</span>
        </h2>
                
        <div className="coin-options">
          {/* Side A */}
          <div className="coin-option" onClick={() => handlePick(getCoinImg(coin.a))}>
            {/* This class 'coin-frame' is the one that contains your Venn-Fix in CSS */}
            <div className="coin-frame">
              <img src={getCoinImg(coin.a)} alt={coin.a} />
            </div>
            <p className="coin-label">{coin.a}</p>
          </div>

          {/* Side B */}
          <div className="coin-option" onClick={() => handlePick(getCoinImg(coin.b))}>
            <div className="coin-frame">
              <img src={getCoinImg(coin.b)} alt={coin.b} />
            </div>
            <p className="coin-label">{coin.b}</p>
          </div>
        </div>

        {/* Using 'clear-button' so it picks up your bronze utility styling */}
        <button className="clear-button" onClick={() => { onClear(); onClose(); }}>
          Remove this coin
        </button>
      </div>
    </div>
  );
}
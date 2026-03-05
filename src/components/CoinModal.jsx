import React from 'react';
import frameImage from '../assets/coinmodal_frame.webp';

export default function CoinModal({ coin, onSelect, onClear, onClose }) {
  if (!coin) return null;

  const getCoinImg = (sideName) => {
    // Points directly to public/coins/
    return `/coins/${coin.id}_coin_of_${coin.name}_${sideName.toLowerCase()}.webp`;
  };

  const handlePick = (imgUrl) => {
    onSelect(coin.id, imgUrl);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ backgroundImage: `url(${frameImage})` }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="coin-options">
          <div className="coin-option" onClick={() => handlePick(getCoinImg(coin.a))}>
            <img src={getCoinImg(coin.a)} alt={coin.a} />
            <p className="coin-label">{coin.a}</p>
          </div>
          <div className="coin-option" onClick={() => handlePick(getCoinImg(coin.b))}>
            <img src={getCoinImg(coin.b)} alt={coin.b} />
            <p className="coin-label">{coin.b}</p>
          </div>
        </div>
        <button className="remove-btn" onClick={onClear}>Remove this coin</button>
      </div>
    </div>
  );
}
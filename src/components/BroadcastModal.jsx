import React from 'react';
import frameImage from '../assets/broadcast_frame.webp';

export default function BroadcastModal({ slotId, selections, bookCovers, coinsData, onClose, onNavigate }) {
  const numericId = Number(slotId);
  const currentCoinData = coinsData.find(c => Number(c.id) === numericId);

  const coinImg = selections[numericId];
  const bookImg = bookCovers[numericId]; // KEEP THIS LINE

  let sideLabel = "";
  
  if (coinImg && currentCoinData) {
    // 1. Force the image path to lowercase for safe matching
    const imgPathLower = coinImg.toLowerCase();
    
    // 2. Dynamically check if the path includes the actual Side B word (e.g., "exile")
    const sideBWord = currentCoinData.b.toLowerCase();
    const isSideB = imgPathLower.includes(sideBWord);
    
    // 3. Assign the correct label
    sideLabel = isSideB ? currentCoinData.b : currentCoinData.a;
  }

  return (
    <div className="broadcast-content" style={{ backgroundImage: `url(${frameImage})` }}>
      
      <div className="broadcast-controls-header">
        <div className="dropdown-wrapper">
          <select 
            className="ghost-select"
            value={slotId} 
            onChange={(e) => onNavigate(e.target.value)}
          >
            {coinsData.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {`THE COIN OF ${coin.name}`.toUpperCase()}
              </option>
            ))}
          </select>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>

      <div className="chronicle-hero-stage">
        {/* LEFT: COIN LANE */}
        <div className="chronicle-hero-lane">
          <div className="chronicle-asset-wrapper chronicle-coin-nudge">
            {coinImg ? (
              <img src={coinImg} alt="Hero Coin" className="chronicle-coin-art" />
            ) : (
              <div className="hero-placeholder">NOT CAST</div>
            )}
          </div>
          
          <div className="chronicle-side-caption">
            {sideLabel ? sideLabel.toUpperCase() : ""}
          </div>
        </div>

        {/* RIGHT: BOOK LANE */}
        <div className="chronicle-hero-lane">
          <div className="chronicle-asset-wrapper chronicle-book-nudge">
            {bookImg ? (
              <img src={bookImg} alt="Hero Book" className="chronicle-book-art" />
            ) : (
              <div className="hero-placeholder">EMPTY</div>
            )}
          </div>
        </div>
      </div>

      <div className="broadcast-footer">
        <button className="broadcast-close" onClick={onClose}>
          Return to the Ledger
        </button>
      </div>
    </div>
  );
}
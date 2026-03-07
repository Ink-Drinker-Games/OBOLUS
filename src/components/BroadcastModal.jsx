import React from 'react';
import frameImage from '../assets/broadcast_frame.webp';

export default function BroadcastModal({ slotId, selections, bookCovers, coinsData, onClose, onNavigate }) {
  // 1. Force the padding for the ID
  const paddedId = String(slotId).padStart(2, '0');
  const currentCoinData = coinsData.find(c => String(c.id) === paddedId);

  // 2. ONLY attempt to show a caption if a coin actually exists in this slot
  const coinImg = selections[Number(slotId)];
  const bookImg = bookCovers[Number(slotId)];

  // 3. Robust side-checking: 
  // We check if the filename contains 'a.webp' OR if it does NOT contain 'b.webp' 
  // This handles cases where the default might be Side A.
  const isSideA = coinImg?.toLowerCase().includes('a.webp');
  const isSideB = coinImg?.toLowerCase().includes('b.webp');

  // 4. Resolve the label ONLY if we have a coin image
  let sideLabel = "";
  if (coinImg) {
    if (isSideA) sideLabel = currentCoinData?.a;
    else if (isSideB) sideLabel = currentCoinData?.b;
    else sideLabel = currentCoinData?.a; // Default fallback for valid coin
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
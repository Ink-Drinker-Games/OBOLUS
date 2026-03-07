import React, { useState } from 'react'; // Add useState here
import frameImage from '../assets/broadcast_frame.webp';

export default function BroadcastModal({ slotId, selections, bookCovers, coinsData, onClose, onNavigate }) {
  // Add state for the custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const numericId = Number(slotId);
  const currentCoinData = coinsData.find(c => Number(c.id) === numericId);

  const coinImg = selections[numericId];
  const bookImg = bookCovers[numericId]; 

  let sideLabel = "";
  if (coinImg && currentCoinData) {
    const imgPathLower = coinImg.toLowerCase();
    const sideBWord = currentCoinData.b.toLowerCase();
    const isSideB = imgPathLower.includes(sideBWord);
    sideLabel = isSideB ? currentCoinData.b : currentCoinData.a;
  }

  return (
    <div className="broadcast-content" style={{ backgroundImage: `url(${frameImage})` }}>
      
      <div className="broadcast-controls-header">
        {/* NEW CUSTOM DROPDOWN */}
        <div className="custom-dropdown-container" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          
          <div className="custom-dropdown-selected">
            {currentCoinData ? `THE COIN OF ${currentCoinData.name}`.toUpperCase() : "SELECT A COIN"}
            <span className="dropdown-arrow" style={{ position: 'relative', right: '0', marginLeft: '15px' }}>
              {isDropdownOpen ? '▲' : '▼'}
            </span>
          </div>

          {isDropdownOpen && (
            <ul className="custom-dropdown-list">
              {coinsData.map((coin) => (
                <li 
                  key={coin.id} 
                  className="custom-dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop click from bubbling up
                    onNavigate(coin.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  {`THE COIN OF ${coin.name}`.toUpperCase()}
                </li>
              ))}
            </ul>
          )}

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
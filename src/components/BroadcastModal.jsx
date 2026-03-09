import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import frameImage from '../assets/broadcast_frame.webp';

export default function BroadcastModal({ slotId, selections, bookCovers, coinsData, onClose, onNavigate }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const chronicleRef = useRef(null); // Reference for the image capture

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

  // The exact "Proxy Sync" logic that conquered CORS on the main board
  const handleCapture = async () => {
    if (!chronicleRef.current) return;

    const images = chronicleRef.current.querySelectorAll('img');
    const originalSrcs = [];

    try {
      const loadPromises = Array.from(images).map((img) => {
        if (img.src.includes('http') && !img.src.includes('wsrv.nl')) {
          originalSrcs.push({ img, src: img.src });
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            img.src = `https://wsrv.nl/?url=${encodeURIComponent(img.src)}`;
          });
        }
        return Promise.resolve();
      });

      await Promise.all(loadPromises);

      const canvas = await html2canvas(chronicleRef.current, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#050505',
        scale: 2
      });

      originalSrcs.forEach(({ img, src }) => { img.src = src; });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const data = [new ClipboardItem({ "image/png": blob })];
        await navigator.clipboard.write(data);
        alert("The Chronicle has been captured and copied.");
      }, 'image/png');

    } catch (err) {
      console.error("Capture Error:", err);
      originalSrcs.forEach(({ img, src }) => { img.src = src; });
      alert("CORS security blocked the capture. Try a manual screenshot!");
    }
  };

  return (
    // 1. Reusing the main board's wrapper to stack the graphic and buttons
    <div className="ledger-wrapper"> 
      
      {/* 2. THE GRAPHIC TO BE CAPTURED */}
      <div className="broadcast-content" ref={chronicleRef} style={{ backgroundImage: `url(${frameImage})` }}>
        
        <div className="broadcast-controls-header">
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
                      e.stopPropagation(); 
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
      </div> 
      {/* END OF CAPTURED GRAPHIC */}

      {/* 3. ANCHORED CONTROLS (Safely outside the capture ref) */}
      <div className="ledger-controls subdued-controls">
        <button className="meta-btn" onClick={handleCapture}>
          <span>Copy the Chronicle</span>
        </button>
        <button className="meta-btn" onClick={onClose}>
          <span>Return to the Ledger</span>
        </button>
      </div>
    </div>
  );
}
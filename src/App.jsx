import { useState, useRef, useEffect } from 'react'; // ADDED useEffect here
import './App.css';
import boardArt from './assets/obolus-ledger.webp'; 
import introArt from './assets/obolus-intro.webp'; 
import coinsData from './data/coins.json';
import CoinModal from './components/CoinModal';
import BookModal from './components/BookModal'; 
import EntranceModal from './components/EntranceModal';
import BroadcastModal from './components/BroadcastModal'; 
import { supabase } from './lib/supabaseClient';
import { toBlob } from 'html-to-image';
import closingGif from './assets/obolus-complete.gif'; 
import html2canvas from 'html2canvas';

function App() {
  const [view, setView] = useState('splash');
  const [selections, setSelections] = useState({});
  const [bookCovers, setBookCovers] = useState({});
  const [activeCoin, setActiveCoin] = useState(null);
  const [activeBookSlot, setActiveBookSlot] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isFading, setIsFading] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const proxyUrl = "https://api.allorigins.win/raw?url=";

  // MANIFEST STATE
  const [showManifest, setShowManifest] = useState(false);
  const [isManifestFading, setIsManifestFading] = useState(false);

  // BROADCAST STATE
  const [broadcastSlot, setBroadcastSlot] = useState(null);
  const [isBroadcastFading, setIsBroadcastFading] = useState(false);

  const ledgerRef = useRef(null);

  // --- WIN CONDITION LOGIC ---
  useEffect(() => {
    const coinCount = Object.keys(selections).length;
    const bookCount = Object.keys(bookCovers).length;
    
    // Triggers only when the board is 100% full (20 coins + 20 books)
    if (coinCount === 20 && bookCount === 20) {
      const timer = setTimeout(() => setShowClosing(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [selections, bookCovers]);

  // --- HANDLERS ---
  const openManifest = () => {
    setIsManifestFading(false); 
    setShowManifest(true);
  };

  const closeManifest = () => {
    setIsManifestFading(true);
    setTimeout(() => {
      setShowManifest(false);
      setIsManifestFading(false);
    }, 1000); 
  };

  const openBroadcast = () => {
    setIsBroadcastFading(false);
    setBroadcastSlot("1"); 
  };

  const closeBroadcast = () => {
    setIsBroadcastFading(true);
    setTimeout(() => {
      setBroadcastSlot(null);
      setIsBroadcastFading(false);
    }, 1000);
  };

  const handleBroadcastNavigate = (newSlotId) => {
    setBroadcastSlot(String(newSlotId)); 
  };

  // --- EXPORT HANDLER (Hardened for Browser Security) ---
  const handleExport = async () => {
    if (!ledgerRef.current) return;

    // 1. Find all book cover images inside the ledger
    const images = ledgerRef.current.querySelectorAll('img');
    const originalSrcs = [];

    try {
      // 2. TEMPORARILY swap the real URLs for proxied URLs
      images.forEach((img) => {
        if (img.src.includes('http') && !img.src.includes('wsrv.nl')) {
          originalSrcs.push({ img, src: img.src });
          // Manually prepend the proxy
          img.src = `https://wsrv.nl/?url=${encodeURIComponent(img.src)}`;
        }
      });

      // 3. Run the capture now that the URLs are "safe"
      const canvas = await html2canvas(ledgerRef.current, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#050505',
        scale: 2
      });

      // 4. IMMEDIATELY swap them back so the UI doesn't flicker/break
      originalSrcs.forEach(({ img, src }) => {
        img.src = src;
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const data = [new ClipboardItem({ "image/png": blob })];
        await navigator.clipboard.write(data);
        alert("The Ledger has been captured and copied.");
      }, 'image/png');

    } catch (err) {
      console.error("Capture Error:", err);
      // Cleanup even if it fails
      originalSrcs.forEach(({ img, src }) => { img.src = src; });
      alert("CORS security blocked the capture. Please use a manual screenshot.");
    }
  };

  const saveToDb = async (slotId, coinPath, bookUrl) => {
    if (!userProfile?.id) return;
    const payload = {
      profile_id: userProfile.id,
      slot_id: Number(slotId),
      coin_path: coinPath,
      book_url: bookUrl
    };
    await supabase.from('ledgers').upsert(payload, { onConflict: 'profile_id,slot_id' });
  };
  
  const handleCoinSelect = (id, imgPath) => {
    const numericId = Number(id);
    setSelections(prev => ({ ...prev, [numericId]: imgPath }));
    saveToDb(numericId, imgPath, bookCovers[numericId] || null);
    setActiveCoin(null);
  };

  const handleClearSlot = (id) => {
    const numericId = Number(id);
    setSelections(prev => {
      const updated = { ...prev };
      delete updated[numericId];
      return updated;
    });
    saveToDb(numericId, null, bookCovers[numericId] || null);
    setActiveCoin(null);
  };

  const handleBookSelect = (id, imgUrl) => {
    const numericId = Number(id);
    setBookCovers(prev => ({ ...prev, [numericId]: imgUrl }));
    saveToDb(numericId, selections[numericId] || null, imgUrl);
    setActiveBookSlot(null);
  };

  const startEntrance = () => {
    setIsFading(true);
    setTimeout(() => { setView('entrance'); setIsFading(false); }, 1000);
  };
  
  const handleLogin = async (name, pin) => {
    setIsFading(true);
    let { data: profile } = await supabase.from('profiles').select('*').eq('player_name', name.toLowerCase()).maybeSingle(); 

    if (!profile) {
      const { data: newProfile } = await supabase.from('profiles').insert([{ player_name: name.toLowerCase(), pin: pin }]).select().single();
      profile = newProfile;
    } else if (profile.pin !== pin) {
      alert("The PIN does not match the Name.");
      setIsFading(false);
      return;
    }

    const { data: ledgerData } = await supabase.from('ledgers').select('slot_id, coin_path, book_url').eq('profile_id', profile.id);
    const savedSelections = {};
    const savedBooks = {};
    if (ledgerData) {
      ledgerData.forEach(row => {
        const sId = Number(row.slot_id); 
        if (row.coin_path) savedSelections[sId] = row.coin_path;
        if (row.book_url) savedBooks[sId] = row.book_url;
      });
    }
    setSelections(savedSelections);
    setBookCovers(savedBooks);
    setUserProfile(profile);
    setTimeout(() => { setView('ledger'); setIsFading(false); }, 1000);
  };

  return (
    <>
      {view === 'splash' && (
        <div className={`splash-container ${isFading ? "fade-out" : "fade-in"}`} onClick={startEntrance}>
          <img src={introArt} className="splash-image" alt="Obolus Intro" />
        </div>
      )}

      {view === 'entrance' && (
        <div className={isFading ? "fade-out" : "fade-in"}>
          <EntranceModal onJoin={handleLogin} />
        </div>
      )}

      {view === 'ledger' && (
        <div className="ledger-wrapper fade-in">
          <div className="ledger-container" ref={ledgerRef}>
            <img src={boardArt} className="board-image" alt="Ledger of the Obols" />
            <div className="overlay">
              {coinsData.map((coin, index) => {
                const currentLeft = `${26.5 + ((index % 10) * 7.23)}%`;
                const isTopHalf = index < 10;
                return (
                  <div key={coin.id}>
                    <div className="hotspot circle" style={{ top: isTopHalf ? '35.5%' : '58.8%', left: currentLeft, width: '6.1%', height: '10.1%' }} onClick={() => setActiveCoin(coin)}>
                      {selections[Number(coin.id)] && <img src={selections[Number(coin.id)]} alt="coin" style={{width: '100%'}} />}
                    </div>
                    <div className="hotspot rect" style={{ top: isTopHalf ? '18.8%' : '70.4%', left: currentLeft, width: '6.1%', height: '15%' }} onClick={() => setActiveBookSlot(coin)}>
                      {bookCovers[Number(coin.id)] && (
                        <img 
                          src={bookCovers[Number(coin.id)]} // BACK TO THE RAW URL
                          alt="book" 
                          style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeCoin && <CoinModal coin={activeCoin} onSelect={handleCoinSelect} onClear={() => handleClearSlot(activeCoin.id)} onClose={() => setActiveCoin(null)} />}
            {activeBookSlot && <BookModal coin={activeBookSlot} onSelect={handleBookSelect} onClose={() => setActiveBookSlot(null)} />}
          </div>
          
          <div className="ledger-controls">
            <button className="meta-btn" onClick={handleExport}><span>Copy the Ledger</span></button>
            <button className="meta-btn" onClick={openManifest}><span>The Coin Manifest</span></button>
            <button className="meta-btn" onClick={openBroadcast}><span>The Chronicle</span></button>
          </div>

          {showManifest && (
            <div className={`modal-overlay manifest-overlay ${isManifestFading ? "fade-out" : "fade-in"}`} onClick={closeManifest}>
              <div className="manifest-content" onClick={(e) => e.stopPropagation()}>
                <img src={new URL('./assets/obolus-coins.webp', import.meta.url).href} alt="The Obolus Coins" style={{ width: '90vw', maxWidth: '1200px', border: '1px solid #c5a059' }} />
                <button className="clear-button" style={{ marginTop: '20px', marginLeft: '0' }} onClick={closeManifest}>Close Manifest</button>
              </div>
            </div>
          )}

          {broadcastSlot && (
            <div className={`modal-overlay broadcast-pane ${isBroadcastFading ? "fade-out" : "fade-in"}`} onClick={closeBroadcast}>
              <div onClick={(e) => e.stopPropagation()}> 
                <BroadcastModal 
                  slotId={broadcastSlot}
                  selections={selections}
                  bookCovers={bookCovers}
                  coinsData={coinsData}
                  onClose={closeBroadcast}
                  onNavigate={handleBroadcastNavigate}
                />
              </div>
            </div>
          )}

          {showClosing && (
            <div className="modal-overlay closing-overlay fade-in">
              <div className="closing-content">
                <img 
                  src={new URL('./assets/obolus-complete.gif', import.meta.url).href} 
                  className="closing-gif" 
                  alt="The Game is Done" 
                />
                <button className="meta-btn closing-exit" onClick={() => setShowClosing(false)}>
                  <span>Return to the Completed Ledger</span>
                </button>
              </div>
            </div>
          )}
        </div> 
      )}
    </>
  );
}

export default App;
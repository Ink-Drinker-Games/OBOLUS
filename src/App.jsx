import { useState } from 'react';
import './App.css';
import boardArt from './assets/obolus-ledger.webp'; 
import introArt from './assets/obolus-intro.webp'; 
import coinsData from './data/coins.json';
import CoinModal from './components/CoinModal';
import BookModal from './components/BookModal'; 
import EntranceModal from './components/EntranceModal'; 
import { supabase } from './lib/supabaseClient';

function App() {
  const [view, setView] = useState('splash'); // 'splash', 'entrance', or 'ledger'
  const [selections, setSelections] = useState({});
  const [bookCovers, setBookCovers] = useState({});
  const [activeCoin, setActiveCoin] = useState(null);
  const [activeBookSlot, setActiveBookSlot] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isFading, setIsFading] = useState(false);

  // --- THE VAULT PLUMBING ---
  const saveToDb = async (slotId, coinPath, bookUrl) => {
    if (!userProfile?.id) return;

    const cleanSlotId = Number(slotId);

    const payload = {
      profile_id: userProfile.id,
      slot_id: cleanSlotId,
      coin_path: coinPath,
      book_url: bookUrl
    };

    console.log("Vault Inscription:", payload);

    const { error } = await supabase
      .from('ledgers')
      .upsert(payload, { onConflict: 'profile_id,slot_id' });

    if (error) {
      console.error("Vault Error:", error.message);
    } else {
      console.log(`Slot ${cleanSlotId} saved successfully.`);
    }
  };
  
  // --- HANDLERS ---
  const handleCoinSelect = (id, imgPath) => {
    const numericId = Number(id); // Force numeric key
    
    // 1. Force a clean, new object for state
    setSelections(prev => ({
      ...prev,
      [numericId]: imgPath 
    }));

    // 2. Save to DB
    saveToDb(numericId, imgPath, bookCovers[numericId] || null);
    setActiveCoin(null);
  };

  const handleClearSlot = (id) => {
    const numericId = Number(id);
    
    // 1. Create a fresh copy and explicitly remove the key
    setSelections(prev => {
      const updated = { ...prev };
      delete updated[numericId];
      // We also delete the string version just in case "01" is lurking
      delete updated[id]; 
      delete updated[String(id)];
      return updated;
    });

    // 2. Clear from DB
    saveToDb(numericId, null, bookCovers[numericId] || null);
    setActiveCoin(null);
  };

  const handleBookSelect = (id, imgUrl) => {
    const numericId = Number(id);
    
    setBookCovers(prev => ({
      ...prev,
      [numericId]: imgUrl
    }));

    saveToDb(numericId, selections[numericId] || null, imgUrl);
    setActiveBookSlot(null);
  };

  const startEntrance = () => {
    setIsFading(true);
    setTimeout(() => {
      setView('entrance');
      setIsFading(false);
    }, 1000);
  };
  
  const handleLogin = async (name, pin) => {
    setIsFading(true);

    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('player_name', name.toLowerCase())
      .maybeSingle(); 

    if (error) {
      console.error("Database error:", error.message);
      setIsFading(false);
      return;
    }

    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{ player_name: name.toLowerCase(), pin: pin }])
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError.message);
        setIsFading(false);
        return;
      }
      profile = newProfile;
    } else {
      if (profile.pin !== pin) {
        alert("The PIN does not match the Name in the Ledger.");
        setIsFading(false);
        return;
      }
    }

    const { data: ledgerData, error: fetchError } = await supabase
      .from('ledgers')
      .select('slot_id, coin_path, book_url')
      .eq('profile_id', profile.id);

    if (fetchError) console.error("Error summoning ledger:", fetchError);

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

    setTimeout(() => {
      setView('ledger');
      setIsFading(false);
    }, 1000);
  };

  return (
    <>
      {/* 1. THE SPLASH */}
      {view === 'splash' && (
        <div 
          className={`splash-container ${isFading ? "fade-out" : "fade-in"}`} 
          onClick={startEntrance}
        >
          <img src={introArt} className="splash-image" alt="Obolus Intro" />
        </div>
      )}

      {/* 2. THE ENTRANCE */}
      {view === 'entrance' && (
        <div className={isFading ? "fade-out" : "fade-in"}>
          <EntranceModal onJoin={handleLogin} />
        </div>
      )}

      {/* 3. THE LEDGER */}
      {view === 'ledger' && (
        <div className="ledger-wrapper fade-in">
          <div className="ledger-container">
            <img src={boardArt} className="board-image" alt="Ledger of the Obols" />
            <div className="overlay">
              {coinsData.map((coin, index) => {
                const startLeft = 26.5; 
                const spacing = 7.23; 
                const currentLeft = `${startLeft + ((index % 10) * spacing)}%`;

                const topBookRow = '18.8%';
                const topCoinRow = '35.5%';
                const bottomCoinRow = '58.8%'; 
                const bottomBookRow = '70.4%';

                const isTopHalf = index < 10;

                return (
                  <div key={coin.id}>
                    {/* COIN HOTSPOT */}
                      <div 
                        className="hotspot circle"
                        style={{ 
                          top: isTopHalf ? topCoinRow : bottomCoinRow, 
                          left: currentLeft, 
                          width: '6.1%', 
                          height: '10.1%' 
                        }}
                        onClick={() => setActiveCoin(coin)}
                      >
                        {selections[Number(coin.id)] && (
                          <img src={selections[Number(coin.id)]} alt="coin" style={{width: '100%'}} />
                        )}
                      </div>

                      {/* BOOK HOTSPOT */}
                      <div 
                        className="hotspot rect"
                        style={{ 
                          top: isTopHalf ? topBookRow : bottomBookRow, 
                          left: currentLeft, 
                          width: '6.1%', 
                          height: '15%' 
                        }}
                        onClick={() => setActiveBookSlot(coin)}
                      >
                        {bookCovers[Number(coin.id)] && (
                          <img 
                            src={bookCovers[Number(coin.id)]} 
                            alt="book" 
                            style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                          />
                        )}
                      </div>
                  </div>
                );
              })}
            </div>

            {/* MODALS */}
            {activeCoin && (
              <CoinModal 
                coin={activeCoin} 
                onSelect={handleCoinSelect} 
                onClear={() => handleClearSlot(activeCoin.id)}
                onClose={() => setActiveCoin(null)} 
              />
            )}

            {activeBookSlot && (
              <BookModal 
                coin={activeBookSlot}
                onSelect={handleBookSelect}
                onClose={() => setActiveBookSlot(null)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
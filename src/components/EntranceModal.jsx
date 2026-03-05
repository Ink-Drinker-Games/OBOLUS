import React, { useState } from 'react';
import frameImage from '../assets/coinmodal_frame.webp';

export default function EntranceModal({ onJoin }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && pin.length === 4) {
      onJoin(name, pin);
    }
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        style={{ backgroundImage: `url(${frameImage})` }}
      >
        <h2 className="modal-title entrance-title">
          <span className="title-top">Welcome To</span>
          <span className="title-bottom">OBOLUS</span>
        </h2>

        <form className="inscription-container entrance-fields" onSubmit={handleSubmit}>
          <input 
            className="book-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player Name..."
            autoFocus
          />
          <input 
            className="book-input"
            type="password"
            maxLength="4"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} // Numbers only
            placeholder="4-Digit PIN"
            style={{ width: '160px', textAlign: 'center', letterSpacing: '4px' }}
          />
          <button type="submit" className="inscribe-button entrance-button">
            Open the Ledger
          </button>
        </form>

        <p className="inscription-hint" style={{ marginTop: '15px' }}>
          New names will create a new ledger. <br /> Existing names require their PIN.
        </p>
      </div>
    </div>
  );
}
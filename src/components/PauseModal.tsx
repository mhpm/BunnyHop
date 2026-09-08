import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onHome }) => {
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic } = useGameStore();

  const handleToggleMusic = () => {
    toggleMusic();
    audioManager.syncMusic();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-pop-in">
        <h2 className="modal-title">PAUSA</h2>

        <div className="modal-actions">
          <button onClick={onResume} className="btn-primary">
            <Play size={22} fill="currentColor" />
            <span>Continuar</span>
          </button>

          <button onClick={onRestart} className="btn-secondary">
            <RotateCcw size={20} />
            <span>Reiniciar Nivel</span>
          </button>

          <button onClick={onHome} className="btn-secondary">
            <Home size={20} />
            <span>Menú Principal</span>
          </button>
        </div>

        <div className="modal-audio-row">
          <button onClick={toggleSound} className="btn-icon">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={handleToggleMusic} className={`btn-icon ${!musicEnabled ? 'btn-disabled' : ''}`}>
            <Music size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

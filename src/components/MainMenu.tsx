import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Play, Volume2, VolumeX, Music, Award, HelpCircle } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenHelp: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onOpenHelp }) => {
  const {
    highScore,
    soundEnabled,
    musicEnabled,
    toggleSound,
    toggleMusic,
  } = useGameStore();

  const handleStart = () => {
    audioManager.playJump();
    onStartGame();
  };

  const handleToggleMusic = () => {
    toggleMusic();
    audioManager.syncMusic();
  };

  return (
    <div className="menu-overlay main-menu-screen">
      <div className="main-menu-toolbar" aria-label="Opciones del menú">
        <button
          type="button"
          onClick={toggleSound}
          className={`btn-icon main-menu-icon ${!soundEnabled ? 'btn-disabled' : ''}`}
          title="Efectos de Sonido"
          aria-label={soundEnabled ? 'Silenciar efectos' : 'Activar efectos'}
        >
          {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>

        <button
          type="button"
          onClick={handleToggleMusic}
          className={`btn-icon main-menu-icon ${!musicEnabled ? 'btn-disabled' : ''}`}
          title="Música de Fondo"
          aria-label={musicEnabled ? 'Silenciar música' : 'Activar música'}
        >
          <Music size={22} />
        </button>

        <button
          type="button"
          onClick={onOpenHelp}
          className="btn-icon main-menu-icon"
          title="Cómo Jugar"
          aria-label="Cómo jugar"
        >
          <HelpCircle size={22} />
        </button>
      </div>

      <div className="main-menu-launch">
        {highScore > 0 && (
          <div className="high-score-badge main-menu-high-score">
            <Award size={18} className="text-yellow-400" />
            <span>Récord: {highScore} pts</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleStart}
          className="btn-primary btn-play main-menu-play"
        >
          <Play size={32} fill="currentColor" />
          <span>PLAY</span>
        </button>

        <div className="menu-world-tag main-menu-world-tag">
          Mundo 1: Pradera Soleada
        </div>
      </div>
    </div>
  );
};

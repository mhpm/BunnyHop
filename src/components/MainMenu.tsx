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
    audioManager.syncMusic();
    onStartGame();
  };

  const handleToggleMusic = () => {
    toggleMusic();
    audioManager.syncMusic();
  };

  return (
    <div className="menu-overlay">
      <div className="menu-card animate-pop-in">
        {/* Animated Bunny Mascot */}
        <div className="mascot-container">
          <div className="mascot-bunny">🐰</div>
          <div className="mascot-carrot">🥕</div>
        </div>

        {/* Logo Title */}
        <div className="logo-group">
          <h1 className="game-title">
            BUNNY <span className="title-highlight">HOP</span>
          </h1>
          <p className="game-subtitle">Pequeñas zanahorias, grandes aventuras</p>
        </div>

        {/* High Score Badge */}
        {highScore > 0 && (
          <div className="high-score-badge">
            <Award size={18} className="text-yellow-400" />
            <span>Récord: {highScore} pts</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="menu-actions">
          <button onClick={handleStart} className="btn-primary btn-play">
            <Play size={24} fill="currentColor" />
            <span>¡JUGAR!</span>
          </button>

          <button onClick={onOpenHelp} className="btn-secondary">
            <HelpCircle size={20} />
            <span>Cómo Jugar</span>
          </button>
        </div>

        {/* Audio Toggles */}
        <div className="menu-audio-toggles">
          <button
            onClick={toggleSound}
            className={`btn-icon ${!soundEnabled ? 'btn-disabled' : ''}`}
            title="Efectos de Sonido"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button
            onClick={handleToggleMusic}
            className={`btn-icon ${!musicEnabled ? 'btn-disabled' : ''}`}
            title="Música de Fondo"
          >
            <Music size={20} />
          </button>
        </div>

        {/* World Preview Badge */}
        <div className="menu-world-tag">
          Mundo 1: Pradera Soleada
        </div>
      </div>
    </div>
  );
};

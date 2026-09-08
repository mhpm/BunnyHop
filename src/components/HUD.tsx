import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Pause, Volume2, VolumeX, Music, HelpCircle } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface HUDProps {
  onPause: () => void;
  onOpenHelp: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onPause, onOpenHelp }) => {
  const {
    lives,
    maxLives,
    carrots,
    score,
    soundEnabled,
    musicEnabled,
    toggleSound,
    toggleMusic,
  } = useGameStore();

  const handleToggleSound = () => {
    toggleSound();
  };

  const handleToggleMusic = () => {
    toggleMusic();
    audioManager.syncMusic();
  };

  return (
    <header className="hud-container" aria-label="Game HUD">
      {/* Left: Hearts (Lives) */}
      <div className="hud-lives" aria-label={`Vidas: ${lives} de ${maxLives}`}>
        {Array.from({ length: maxLives }).map((_, i) => (
          <span
            key={i}
            className={`heart-icon ${i < lives ? 'heart-active' : 'heart-empty'}`}
          >
            ❤️
          </span>
        ))}
      </div>

      {/* Center: Carrots & Score */}
      <div className="hud-stats">
        <div className="hud-badge carrot-badge">
          <span className="carrot-icon animate-bounce">🥕</span>
          <span className="badge-value">x {carrots}</span>
        </div>
        <div className="hud-badge score-badge">
          <span className="badge-label">PUNTOS</span>
          <span className="badge-value">{score}</span>
        </div>
      </div>

      {/* Right: Controls & Pause */}
      <nav className="hud-buttons" aria-label="Game controls">
        <button
          onClick={handleToggleSound}
          className="hud-btn"
          title={soundEnabled ? 'Silenciar Efectos' : 'Activar Efectos'}
          aria-label={soundEnabled ? 'Silenciar Efectos' : 'Activar Efectos'}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        <button
          onClick={handleToggleMusic}
          className={`hud-btn ${!musicEnabled ? 'hud-btn-off' : ''}`}
          title={musicEnabled ? 'Silenciar Música' : 'Activar Música'}
          aria-label={musicEnabled ? 'Silenciar Música' : 'Activar Música'}
        >
          <Music size={20} />
        </button>

        <button
          onClick={onOpenHelp}
          className="hud-btn"
          title="Cómo Jugar"
          aria-label="Cómo Jugar"
        >
          <HelpCircle size={20} />
        </button>

        <button
          onClick={onPause}
          className="hud-btn hud-btn-pause"
          title="Pausar Juego (ESC)"
          aria-label="Pausar Juego"
        >
          <Pause size={20} />
        </button>
      </nav>
    </header>
  );
};

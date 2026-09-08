import React from 'react';
import { useGameStore } from '../store/gameStore';
import { RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart, onHome }) => {
  const { score, carrots } = useGameStore();

  return (
    <div className="modal-overlay">
      <div className="modal-card gameover-card animate-pop-in">
        <div className="gameover-mascot">💔🐰</div>
        <h2 className="modal-title text-gameover">FIN DE LA PARTIDA</h2>
        <p className="gameover-message">¡No te rindas! Bunny aún puede recolectar más zanahorias.</p>

        {/* Stats */}
        <div className="victory-stats">
          <div className="stat-box">
            <span className="stat-label">Zanahorias</span>
            <span className="stat-value">🥕 {carrots}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Puntos</span>
            <span className="stat-value">{score} pts</span>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onRestart} className="btn-primary btn-retry">
            <RotateCcw size={20} />
            <span>Reintentar</span>
          </button>

          <button onClick={onHome} className="btn-secondary">
            <Home size={20} />
            <span>Menú Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

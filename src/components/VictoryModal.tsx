import React from 'react';
import { useGameStore } from '../store/gameStore';
import { RotateCcw, Home, ArrowRight, Award } from 'lucide-react';

interface VictoryModalProps {
  onNextLevel: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onNextLevel, onRestart, onHome }) => {
  const { carrots, totalLevelCarrots, score, stars } = useGameStore();

  return (
    <div className="modal-overlay">
      <div className="modal-card victory-card animate-pop-in">
        <div className="victory-crown">🏆</div>
        <h2 className="modal-title text-victory">¡NIVEL COMPLETADO!</h2>

        {/* Stars */}
        <div className="stars-row">
          {[1, 2, 3].map((starIndex) => (
            <span
              key={starIndex}
              className={`star-icon ${starIndex <= stars ? 'star-earned animate-star' : 'star-dim'}`}
              style={{ animationDelay: `${starIndex * 0.2}s` }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="victory-stats">
          <div className="stat-box">
            <span className="stat-label">Zanahorias</span>
            <span className="stat-value">🥕 {carrots} / {totalLevelCarrots}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Puntuación Total</span>
            <span className="stat-value"><Award size={18} className="inline text-yellow-500 mr-1" />{score} pts</span>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onNextLevel} className="btn-primary">
            <span>¡Jugar de Nuevo!</span>
            <ArrowRight size={20} />
          </button>

          <button onClick={onRestart} className="btn-secondary">
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

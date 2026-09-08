import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { GameScene } from '../game/scenes/GameScene';

interface MobileControlsProps {
  gameScene: GameScene | null;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ gameScene }) => {
  const setLeft = (active: boolean) => {
    if (gameScene?.player) {
      gameScene.player.touchLeft = active;
    }
  };

  const setRight = (active: boolean) => {
    if (gameScene?.player) {
      gameScene.player.touchRight = active;
    }
  };

  const triggerJump = (active: boolean) => {
    if (gameScene?.player) {
      gameScene.player.touchJump = active;
    }
  };

  return (
    <div className="mobile-controls-container">
      {/* Left / Right D-Pad */}
      <div className="mobile-dpad">
        <button
          className="touch-btn touch-btn-dir"
          onPointerDown={() => setLeft(true)}
          onPointerUp={() => setLeft(false)}
          onPointerLeave={() => setLeft(false)}
          aria-label="Izquierda"
        >
          <ArrowLeft size={32} />
        </button>

        <button
          className="touch-btn touch-btn-dir"
          onPointerDown={() => setRight(true)}
          onPointerUp={() => setRight(false)}
          onPointerLeave={() => setRight(false)}
          aria-label="Derecha"
        >
          <ArrowRight size={32} />
        </button>
      </div>

      {/* Jump Button */}
      <div className="mobile-actions">
        <button
          className="touch-btn touch-btn-jump"
          onPointerDown={() => triggerJump(true)}
          onPointerUp={() => triggerJump(false)}
          onPointerLeave={() => triggerJump(false)}
          aria-label="Saltar"
        >
          <ArrowUp size={36} />
          <span className="jump-label">SALTO</span>
        </button>
      </div>
    </div>
  );
};

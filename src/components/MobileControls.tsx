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

  const createPointerHandlers = (action: (active: boolean) => void) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
      action(true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
      action(false);
    },
    onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
      action(false);
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
    },
  });

  return (
    <div className="mobile-controls-container">
      {/* Left / Right D-Pad */}
      <div className="mobile-dpad">
        <button
          className="touch-btn touch-btn-dir"
          {...createPointerHandlers(setLeft)}
          aria-label="Izquierda"
        >
          <ArrowLeft size={32} />
        </button>

        <button
          className="touch-btn touch-btn-dir"
          {...createPointerHandlers(setRight)}
          aria-label="Derecha"
        >
          <ArrowRight size={32} />
        </button>
      </div>

      {/* Jump Button */}
      <div className="mobile-actions">
        <button
          className="touch-btn touch-btn-jump"
          {...createPointerHandlers(triggerJump)}
          aria-label="Saltar"
        >
          <ArrowUp size={36} />
          <span className="jump-label">SALTO</span>
        </button>
      </div>
    </div>
  );
};

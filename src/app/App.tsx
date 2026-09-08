import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { phaserGameConfig } from '../game/config/gameConfig';
import { GameScene } from '../game/scenes/GameScene';
import { useGameStore } from '../store/gameStore';
import { HUD } from '../components/HUD';
import { MainMenu } from '../components/MainMenu';
import { PauseModal } from '../components/PauseModal';
import { VictoryModal } from '../components/VictoryModal';
import { GameOverModal } from '../components/GameOverModal';
import { HelpModal } from '../components/HelpModal';
import { MobileControls } from '../components/MobileControls';
import { audioManager } from '../game/systems/AudioManager';

export const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameScene, setGameScene] = useState<GameScene | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const { gameState, setGameState, resetLevelStats } = useGameStore();

  // Initialize Phaser Game instance
  useEffect(() => {
    if (!gameRef.current) {
      const game = new Phaser.Game(phaserGameConfig);
      gameRef.current = game;

      // Poll until GameScene is active and ready
      const checkScene = () => {
        const scene = game.scene.getScene('GameScene') as GameScene;
        if (scene) {
          setGameScene(scene);
        } else {
          setTimeout(checkScene, 100);
        }
      };
      checkScene();
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Handle Game Restart
  const handleRestart = () => {
    if (gameScene) {
      resetLevelStats();
      gameScene.scene.restart();
    }
    setGameState('PLAYING');
  };

  // Handle Start Game from Menu
  const handleStartGame = () => {
    if (gameScene) {
      resetLevelStats();
      gameScene.scene.restart();
    }
    setGameState('PLAYING');
  };

  // Handle Resume Game from Pause
  const handleResume = () => {
    setGameState('PLAYING');
  };

  // Handle Return to Main Menu
  const handleHome = () => {
    audioManager.stopBGM();
    setGameState('MENU');
  };

  return (
    <div className="game-wrapper">
      {/* Phaser Canvas Container */}
      <div id="phaser-container" className="canvas-container" />

      {/* React UI Overlays */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenHelp={() => setShowHelp(true)}
        />
      )}

      {gameState === 'PLAYING' && (
        <>
          <HUD
            onPause={() => setGameState('PAUSED')}
            onOpenHelp={() => setShowHelp(true)}
          />
          <MobileControls gameScene={gameScene} />
        </>
      )}

      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {gameState === 'VICTORY' && (
        <VictoryModal
          onNextLevel={handleRestart}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {gameState === 'GAMEOVER' && (
        <GameOverModal
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
};

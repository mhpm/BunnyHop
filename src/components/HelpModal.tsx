import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card help-card animate-pop-in">
        <div className="help-header">
          <h2 className="modal-title">¿CÓMO JUGAR?</h2>
          <button onClick={onClose} className="btn-close" aria-label="Cerrar">
            <X size={24} />
          </button>
        </div>

        <div className="help-content">
          {/* Controls */}
          <div className="help-section">
            <h3 className="section-title">🎮 Controles</h3>
            <div className="controls-grid">
              <div className="control-item">
                <span className="key-cap">A</span> <span className="key-cap">←</span>
                <span>Izquierda</span>
              </div>
              <div className="control-item">
                <span className="key-cap">D</span> <span className="key-cap">→</span>
                <span>Derecha</span>
              </div>
              <div className="control-item">
                <span className="key-cap">ESPACIO</span> / <span className="key-cap">W</span>
                <span>Saltar (mantén para más altura)</span>
              </div>
              <div className="control-item">
                <span className="key-cap">S</span> / <span className="key-cap">↓</span>
                <span>Dash al correr (deslizamiento veloz)</span>
              </div>
              <div className="control-item">
                <span className="key-cap">ESC</span>
                <span>Pausar</span>
              </div>
            </div>
          </div>

          {/* Enemy Stomp Mechanic */}
          <div className="help-section">
            <h3 className="section-title">🐞 Mecánica de Enemigos</h3>
            <div className="mechanic-banner">
              <p><strong>¡Salta sobre ellos desde arriba para aplastarlos!</strong></p>
              <p className="mechanic-sub">Rebotarás en el aire y ganarás puntos extra. Si los tocas de lado, Bunny perderá un corazón ❤️.</p>
            </div>
            <div className="enemy-types-row">
              <div className="enemy-type-badge">
                <span className="text-xl">🐞</span>
                <span>Mariquita</span>
              </div>
              <div className="enemy-type-badge">
                <span className="text-xl">🐛</span>
                <span>Oruga</span>
              </div>
              <div className="enemy-type-badge">
                <span className="text-xl">🐌</span>
                <span>Caracol</span>
              </div>
              <div className="enemy-type-badge">
                <span className="text-xl">🪲</span>
                <span>Escarabajo (2 saltos)</span>
              </div>
            </div>
          </div>

          {/* Collectibles */}
          <div className="help-section">
            <h3 className="section-title">🥕 Objetos e Interacciones</h3>
            <div className="items-list">
              <p>🥕 <strong>Zanahoria:</strong> +1 zanahoria para completar el nivel con 3 estrellas.</p>
              <p>✨ <strong>Zanahoria Dorada:</strong> +5 zanahorias ocultas en rutas secretas.</p>
              <p>📦 <strong>Cajas de Madera:</strong> Salta sobre ellas para romperlas y descubrir sorpresas.</p>
              <p>🏆 <strong>Santuario Dorado:</strong> Llega al final del recorrido para ganar.</p>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="btn-primary w-full mt-4">
          ¡Entendido, a saltar!
        </button>
      </div>
    </div>
  );
};

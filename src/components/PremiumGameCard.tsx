import React from 'react';
import './PremiumGameCard.css';

const PremiumGameCard = () => {
    return (
        <div className="premium-game-card">
            <div className="card-content">
                <h2>Premium Game Title</h2>
                <p>Description of the premium game.</p>
                <button className="play-button">Play Now</button>
            </div>
        </div>
    );
};

export default PremiumGameCard;

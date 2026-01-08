/* modes/rituel/cards/qui_pourrait/logic.js */
import { data } from './data.js';

export default class QuiPourraitGame {
    constructor(players) {
        this.players = players || [];
    }

    getCards() {
        return data.map(text => {
            
            // MODIFICATION ICI : On ajoute 'this' dans les parenthèses de nextRituelCard
            const playersHtml = this.players.map(p => 
                `<button class="vote-btn" onclick="event.stopPropagation(); window.nextRituelCard(this)">${p}</button>`
            ).join('');

            return {
                type: 'qui_pourrait',
                html: `
                    <div class="flip-container" id="current-card">
                        <div class="flip-inner">
                            <div class="flip-front">
                                <div class="rituel-category" style="background:#e3f2fd; color:#2196f3;">
                                    Qui pourrait...
                                </div>
                                <div class="rituel-content">${text}</div>
                                <div class="rituel-subtext">Touchez pour retourner ↻</div>
                            </div>

                            <div class="flip-back">
                                <h3 style="font-size:1.2em; margin-bottom:10px;">Résultat du vote</h3>
                                <p style="font-size:0.9em; color:#888;">Qui a été désigné ?</p>
                                <div class="vote-grid">${playersHtml}</div>
                            </div>
                        </div>
                    </div>
                `
            };
        });
    }
}
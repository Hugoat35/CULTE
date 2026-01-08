/* modes/rituel/cards/je_nai_jamais/logic.js */
import { data } from './data.js';

export default class JeNaiJamaisGame {
    constructor(players) {
        this.players = players;
    }

    getCards() {
        return data.map(text => {
            return {
                type: 'je_nai_jamais',
                html: `
                    <div class="rituel-card">
                        <div class="rituel-category" style="background:#ffebee; color:#e53935;">
                            Je n'ai jamais
                        </div>
                        
                        <div class="rituel-content">
                            ${text}
                        </div>
                        
                        <div class="rituel-subtext" style="color:#e53935; font-weight:bold;">
                            {drink} si vous l'avez fait ! 🍺
                        </div>
                    </div>
                `
            };
        });
    }
}
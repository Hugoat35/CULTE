import { data } from './data.js';

export default class DiversGame {
    constructor(players) {
        this.players = players;
    }

    getCards() {
        return data.map(text => {
            return {
                type: 'divers',
                html: `
                    <div class="rituel-card">
                        <div class="rituel-category" style="background:#fff3e0; color:#f57c00;">
                            Action / Hasard 🎲
                        </div>
                        
                        <div class="rituel-content">
                            ${text}
                        </div>
                        
                        <div class="rituel-subtext" style="color:#f57c00; font-weight:600;">
                            Bonne chance !
                        </div>
                    </div>
                `
            };
        });
    }
}
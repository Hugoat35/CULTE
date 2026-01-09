/* modes/rituel/cards/je_nai_jamais/logic.js */
import { data } from './data.js';

export default class JeNaiJamaisGame {
    constructor(players) {}

    getConfig() {
        return {
            mode: 'simple', // Mode carte simple (pas de vote)
            theme: {
                category: "Je n'ai jamais",
                color: "#e53935", // Rouge
                bg: "#ffebee"     // Fond rouge très clair
            },
            // Le tag {drink} sera remplacé automatiquement par le moteur
            subtext: "{drink} si vous l'avez fait ! 🍺",
            data: data
        };
    }
}
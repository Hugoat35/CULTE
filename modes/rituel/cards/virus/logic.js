/* modes/rituel/cards/virus/logic.js */
import { data } from './data.js';

export default class VirusGame {
    constructor(players) {}

    getConfig() {
        return {
            mode: 'virus', // Nouveau mode spécial !
            theme: {
                category: "ALERTE VIRUS ☢️",
                color: "#2e7d32", // Vert foncé texte
                bg: "#e8f5e9"     // Vert clair fond
            },
            subtext: "Respectez la règle ou buvez !",
            data: data
        };
    }
}
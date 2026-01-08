import { data } from './data.js';

export default class DiversGame {
    constructor(players) {
        // Plus besoin de stocker players ici, on renvoie juste la config
    }

    // On remplace getCards() par getConfig()
    getConfig() {
        return {
            mode: 'simple', // Dit au moteur d'utiliser le template simple
            theme: {
                category: "Action / Hasard 🎲",
                color: "#f57c00",
                bg: "#fff3e0"
            },
            subtext: "Bonne chance !",
            data: data // On passe les données brutes (Strings ou Objets)
        };
    }
}
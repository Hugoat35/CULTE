import { data } from './data.js';

// 1. Change le nom de la classe ici (Optionnel mais plus propre)
export default class EvenementGame { 
    constructor(players) {}

    getConfig() {
        return {
            mode: 'simple', 
            theme: {
                // 2. Change le Titre affiché sur la carte
                category: "⚠️ ÉVÉNEMENT ⚠️", 
                
                // Tu peux garder le style sombre/rouge, ou changer si tu veux :
                color: "#ff1744", // Rouge
                bg: "#212121"     // Noir
            },
            subtext: "Le sort en est jeté...",
            data: data
        };
    }
}
import QuiPourrait from './qui_pourrait/logic.js';
import JeNaiJamais from './je_nai_jamais/logic.js';
import Divers from './divers/logic.js'; // <--- 1. Import

export default [
    {
        game: QuiPourrait,
        weight: 5 
    },
    {
        game: JeNaiJamais,
        weight: 5
    },
    {
        game: Divers,
        weight: 5 
    }
];
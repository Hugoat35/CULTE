import QuiPourrait from './qui_pourrait/logic.js';
import JeNaiJamais from './je_nai_jamais/logic.js';
import Divers from './divers/logic.js'; // <--- 1. Import
import Virus from './virus/logic.js'; // <--- 2. Import
import Hardcore from './hardcore/logic.js';

export default [
    {
        game: QuiPourrait,
        weight: 3 
    },
    {
        game: JeNaiJamais,
        weight: 4
    },
    {
        game: Divers,
        weight: 5 
    },
    {
        game: Virus,
        weight: 0.5 
    },
    {
        game: Hardcore,
        weight: 0.5
    }
];
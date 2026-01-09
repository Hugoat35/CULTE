import QuiPourrait from './qui_pourrait/logic.js';
import JeNaiJamais from './je_nai_jamais/logic.js';
import Divers from './divers/logic.js'; // <--- 1. Import
import Virus from './virus/logic.js'; // <--- 2. Import
import Hardcore from './hardcore/logic.js';
import JeuxGame, { handleMiniGame as handleSplitGame } from './jeux/logic.js'; // <--- 3. Import

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
        weight: 0.6
    },
    {
        game: Hardcore,
        weight: 0.4
    },
    {
        game: JeuxGame,
        weight: 20,
        handler: handleSplitGame // <--- 4. Handler
    }
];
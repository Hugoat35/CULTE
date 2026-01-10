/* modes/palmier/data.js */

export const getRule = (value, color) => {
    // AS (1)
    if (value === 1) {
        if (color === 'red') return "<strong>As Rouge :</strong> C'est pour toi ! Savoure ton verre cul sec.";
        return "<strong>As Noir :</strong> Distribue un cul sec au joueur de ton choix.";
    }

    // 2 et 3
    if (value === 2 || value === 3) {
        if (color === 'red') return `<strong>${value} Rouge :</strong> Bois ${value} gorgées.`;
        return `<strong>${value} Noir :</strong> Distribue ${value} gorgées (à une ou plusieurs personnes).`;
    }

    // Autres règles
    switch (value) {
        case 4: return "<strong>4 - Four to the floor :</strong> Tout le monde pointe le sol ! Le dernier boit 1 gorgée.";
        case 5: return "<strong>5 - Five to the sky :</strong> Tout le monde lève le doigt ! Le dernier boit 1 gorgée.";
        case 6: return "<strong>6 - Dans ma valise :</strong> « Dans ma valise il y a... ». Les suivants répètent et ajoutent un mot. 1ère erreur = 1 gorgée.";
        case 7: return "<strong>7 - Maître de la question :</strong> Si tu poses une question, celui qui répond boit. Sauf s'il dit « Ta gueule » (tu bois).";
        case 8: return "<strong>8 :</strong> Distribue 8 gorgées comme tu veux.";
        case 9: return "<strong>9 - J'ai déjà / J'ai jamais :</strong> Raconte une expérience. Ceux qui ne l'ont jamais fait boivent.";
        case 10: return "<strong>10 - Maître du Freeze :</strong> Quand tu te figes, tout le monde doit t'imiter. Le dernier boit.";
        
        // --- NOUVELLES RÈGLES ---
        case 11: return "<strong>Valet - Thème :</strong> Choisis un thème. Chacun donne une réponse. Celui qui sèche boit !";
        case 12: return "<strong>Dame - Tournée générale :</strong> Tout le monde boit une gorgée ! Santé 🍻";
        case 13: return "<strong>Roi - Invente une règle :</strong> Crée une règle (ex: interdit de dire 'oui'). Celui qui l'enfreint boit.";
        
        default: return "Pas de règle spéciale.";
    }
};
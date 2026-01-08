/* modes/rituel/cards/virus/data.js */

export const data = [
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} n'a plus le droit de répondre aux questions jusqu'à nouvel ordre. {drink} à chaque manquement.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} peut à nouveau parler librement.",
        duration: [4, 8] // Durera entre 4 et 8 tours
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} doit terminer toutes ses phrases par 'Chef'.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} peut arrêter d'appeler tout le monde Chef.",
        duration: [5, 10]
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} devient le barman. C'est lui qui sert à boire à tout le monde.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} n'est plus le barman (ouf).",
        duration: [5, 10]
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Tout le monde doit boire de la main gauche (ou main faible). {drink} en cas d'erreur.",
        end: "💉 <strong>FIN DU VIRUS</strong> : Vous pouvez reboire de la main droite.",
        duration: [5, 8]
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Interdit de dire le prénom de quelqu'un. On désigne du doigt !",
        end: "💉 <strong>FIN DU VIRUS</strong> : Vous pouvez utiliser les prénoms.",
        duration: [4, 7]
    }
];
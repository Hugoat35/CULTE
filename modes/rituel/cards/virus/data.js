/* modes/rituel/cards/virus/data.js */

export const data = [
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} n'a plus le droit de répondre aux questions jusqu'à nouvel ordre. {drink} à chaque manquement.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} peut à nouveau parler librement.",
        duration: [6, 10] // Pas trop long sinon le joueur s'ennuie
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} doit terminer toutes ses phrases par 'Chef'.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} peut arrêter d'appeler tout le monde Chef.",
        duration: [10, 16] // Drôle assez longtemps
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} devient le barman. C'est lui qui sert à boire à tout le monde.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} n'est plus le barman (ouf).",
        duration: [10, 18] // Rôle passif, peut durer
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Tout le monde doit boire de la main gauche (ou main faible). {drink} en cas d'erreur.",
        end: "💉 <strong>FIN DU VIRUS</strong> : Vous pouvez reboire de la main droite.",
        duration: [12, 20] // Le classique, on le garde longtemps
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Interdit de dire le prénom de quelqu'un. On désigne du doigt !",
        end: "💉 <strong>FIN DU VIRUS</strong> : Vous pouvez utiliser les prénoms.",
        duration: [6, 12] // Devient vite confusant
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} désigne un autre joueur, pour chaque pénalité que tu prends, il la prend aussi",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} et son duo peuvent arrêter de partager les pénalités.",
        duration: [8, 14]
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} doit parler sans montrer ses dents (en recouvrant ses lèvres). {drink} à chaque sourire visible.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} peut retrouver son sourire normal.",
        duration: [4, 8] // Très fatiguant physiquement
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Mode haute société. Tout le monde doit se vouvoyer (interdit de se dire 'Tu').",
        end: "💉 <strong>FIN DU VIRUS</strong> : Retour au tutoiement, bande de gueux.",
        duration: [10, 18] // Change l'ambiance, sympa sur la durée
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} devient le 'Question Master'. Si quelqu'un répond à une de ses questions, il prend {drink}.",
        end: "💉 <strong>FIN DU VIRUS</strong> : On peut à nouveau répondre à {p1} sans danger.",
        duration: [12, 20] // Il faut du temps pour piéger les gens
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Interdit de prononcer les mots 'Boire', 'Verre' ou 'Alcool'. Trouvez des synonymes !",
        end: "💉 <strong>FIN DU VIRUS</strong> : Vous pouvez appeler un chat un chat (et un verre un verre).",
        duration: [8, 14]
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} est une célébrité. Interdit de le/la regarder dans les yeux quand il/elle parle.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} est redevenu un inconnu, vous pouvez le regarder.",
        duration: [6, 10]
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Le sol est de la lave ! Interdit de poser les pieds par terre (sur les barreaux de chaises ou jambes croisées).",
        end: "💉 <strong>FIN DU VIRUS</strong> : Le sol a refroidi, posez vos pieds.",
        duration: [6, 8] // Inconfortable, court c'est mieux
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} doit faire un bruit de 'Mouton' (Bêêê) avant chaque phrase.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} n'est plus un animal de la ferme.",
        duration: [6, 10] // Drôle mais devient vite lourd
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Tout le monde pose son téléphone face contre table (ou loin). Le premier qui le touche prend une pénalité ultime.",
        end: "💉 <strong>FIN DU VIRUS</strong> : Vous pouvez récupérer vos précieux téléphones.",
        duration: [12, 20] // Peut durer longtemps, c'est bénéfique
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} doit répéter le dernier mot de toutes ses phrases deux fois... deux fois.",
        end: "💉 <strong>FIN DU VIRUS</strong> : L'écho est fini... fini.",
        duration: [5, 9] // Assez court
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Avant de boire, il faut trinquer avec une personne imaginaire à côté de soi.",
        end: "💉 <strong>FIN DU VIRUS</strong> : Vos amis imaginaires sont partis.",
        duration: [8, 12]
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} ne peut plus utiliser ses mains pour boire (demande à un voisin ou utilise tes pieds jsp...).",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} retrouve l'usage de ses mains.",
        duration: [6, 8] // Galère logistique, court
    },
    {
        start: "🦠 <strong>VIRUS</strong> : Interdit de dire 'Oui' ou 'Non'. {drink} à chaque erreur.",
        end: "💉 <strong>FIN DU VIRUS</strong> : Le Ni Oui Ni Non est terminé.",
        duration: [8, 15] // Un classique qui demande de l'attention
    },
    {
        start: "🦠 <strong>VIRUS</strong> : {p1} devient le clapper fou, des que tu claques des mains, tout le monde doit le faire, le dernier prend {drink}.",
        end: "💉 <strong>FIN DU VIRUS</strong> : {p1} tu peux laisser nos oreilles tranquilles.",
        duration: [10, 15]
    },
];
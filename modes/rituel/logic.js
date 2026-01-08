/* modes/rituel/logic.js */
import activeGames from './cards/index.js';

export default class RituelGame {
    constructor(players, container) {
        this.players = players;
        this.container = container;
        
        // On stocke les jeux séparément au lieu de tout mélanger
        this.subGames = []; 
        this.voteCounts = {};
    }

    start() {
        this.container.className = 'rituel-zone';
        
        // Initialisation des votes
        this.players.forEach(name => this.voteCounts[name] = 0);

        // --- Configuration des jeux ---
        // On prépare chaque jeu séparément
        activeGames.forEach(config => {
            const instance = new config.game(this.players);
            this.subGames.push({
                weight: config.weight,       // La probabilité (ex: 5)
                cards: instance.getCards(),  // Les cartes disponibles
                name: instance.constructor.name
            });
        });

        // --- Logique d'Animation & Vote (Reste identique à avant) ---
        const animateAndNext = (btnElement) => {
            if (btnElement) {
                btnElement.classList.add('selected');
                const votedName = btnElement.innerText;
                if (this.voteCounts[votedName] !== undefined) {
                    this.voteCounts[votedName]++;
                }
            }

            const currentCardEl = document.getElementById('current-card');
            
            // Délai de lecture (0.8s)
            setTimeout(() => {
                if (currentCardEl) {
                    currentCardEl.classList.add('card-exit');
                    // Délai d'animation (0.75s)
                    setTimeout(() => this.nextCard(), 750);
                } else {
                    this.nextCard();
                }
            }, 800); 
        };

        window.nextRituelCard = (btn) => animateAndNext(btn);

        // Premier lancement
        this.nextCard();

        // Gestion du clic global (Flip ou Next selon le type de carte)
        this.container.addEventListener('click', (e) => {
            // Si c'est un bouton ou une anim en cours, on touche pas
            const cardEl = document.getElementById('current-card'); // Carte qui se retourne (Flip)
            const simpleCard = document.querySelector('.rituel-card:not(.flip-container)'); // Carte simple

            if(e.target.tagName === 'BUTTON' || (cardEl && cardEl.classList.contains('card-exit')) || (simpleCard && simpleCard.classList.contains('card-exit'))) return;

            // CAS 1 : C'est une carte à retourner (Qui pourrait)
            if (cardEl) {
                cardEl.classList.toggle('flipped');
            }
            
            // CAS 2 : C'est une carte simple (Je n'ai jamais)
            // Si on clique dessus, ça passe à la suivante directement (avec anim)
            else if (simpleCard) {
                simpleCard.classList.add('card-exit');
                setTimeout(() => this.nextCard(), 750);
            }
        });
    }

    // --- C'est ICI que la magie des probabilités opère ---
    nextCard() {
        // 1. Calculer le poids total (ex: 5 + 5 + 1 = 11)
        const totalWeight = this.subGames.reduce((sum, g) => sum + g.weight, 0);
        
        // 2. Tirer un nombre aléatoire entre 0 et Total
        let randomValue = Math.random() * totalWeight;
        
        // 3. Trouver quel jeu correspond à ce nombre
        let selectedGame = null;
        for (const game of this.subGames) {
            randomValue -= game.weight;
            if (randomValue <= 0) {
                selectedGame = game;
                break;
            }
        }

        // Sécurité
        if (!selectedGame) selectedGame = this.subGames[0];

        // 4. Piocher une carte au hasard dans ce jeu
        const randomCardIndex = Math.floor(Math.random() * selectedGame.cards.length);
        const card = selectedGame.cards[randomCardIndex];

        this.renderCard(card);
    }

    renderCard(card) {
        // 1. On récupère le HTML de la carte
        let finalHtml = card.html;

        // 2. On remplace toutes les occurrences de "{drink}" par une valeur aléatoire
        // .replace avec une fonction permet de recalculer à chaque fois qu'il trouve le mot
        finalHtml = finalHtml.replace(/{drink}/g, () => {
            const rand = Math.random(); // Génère un chiffre entre 0.0 et 1.0
            
            if (rand < 0.5) {
                return "1 pénalité";      // 50% de chance (0.0 à 0.50)
            } else if (rand < 0.8) {
                return "2 pénalités";     // 30% de chance (0.50 à 0.80)
            } else {
                return "3 pénalités";     // 20% de chance (0.80 à 1.0)
            }
        });

        // 3. On injecte le résultat final
        this.container.innerHTML = finalHtml;
    }

    cleanup() {
        delete window.nextRituelCard;
    }
}
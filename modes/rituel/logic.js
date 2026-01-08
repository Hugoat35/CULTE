import activeGames from './cards/index.js';

export default class RituelGame {
    constructor(players, container) {
        this.players = players;
        this.container = container;
        this.deck = [];
        this.lastCardIndex = -1;
        
        // NOUVEAU : On prépare le stockage des votes
        this.voteCounts = {};
    }

    start() {
        this.container.className = 'rituel-zone';
        
        // 1. Initialisation : Tout le monde commence à 0 vote
        this.players.forEach(name => {
            this.voteCounts[name] = 0;
        });

        // Fonction intermédiaire pour gérer l'animation et le comptage
        const animateAndNext = (btnElement) => {
            
            if (btnElement) {
                // A. On met le bouton en rouge
                btnElement.classList.add('selected');

                // B. COMPTAGE DES VOTES (Discret)
                const votedName = btnElement.innerText; // On lit le nom sur le bouton
                if (this.voteCounts[votedName] !== undefined) {
                    this.voteCounts[votedName]++;
                    
                    // (Optionnel) Pour voir que ça marche dans la console du navigateur :
                    console.log(`Vote pour ${votedName}. Total: ${this.voteCounts[votedName]}`);
                }
            }

            const currentCardEl = document.getElementById('current-card');
            
            // 2. Pause lecture (800ms)
            setTimeout(() => {
                if (currentCardEl) {
                    // 3. Animation Sortie
                    currentCardEl.classList.add('card-exit');
                    
                    // 4. Changement de carte (après l'anim CSS de 0.8s)
                    setTimeout(() => {
                        this.nextCard();
                    }, 750); 
                    
                } else {
                    this.nextCard();
                }
            }, 800); 
        };

        // Connexion à la fonction globale
        window.nextRituelCard = (btn) => animateAndNext(btn);

        this.buildDeck();
        this.nextCard();

        // Gestion du Flip
        this.container.addEventListener('click', (e) => {
            const cardEl = document.getElementById('current-card');
            if(e.target.tagName === 'BUTTON' || (cardEl && cardEl.classList.contains('card-exit'))) return;

            if (cardEl) {
                cardEl.classList.toggle('flipped');
            }
        });
    }

    buildDeck() {
        activeGames.forEach(GameClass => {
            const gameInstance = new GameClass(this.players);
            this.deck.push(...gameInstance.getCards());
        });
        if (this.deck.length === 0) this.deck.push({ html: '<h3>Oups</h3>' });
    }

    nextCard() {
        if (this.deck.length === 0) return;
        let randomIndex;
        if (this.deck.length > 1) {
            do { randomIndex = Math.floor(Math.random() * this.deck.length); } 
            while (randomIndex === this.lastCardIndex);
        } else { randomIndex = 0; }
        
        this.lastCardIndex = randomIndex;
        this.renderCard(this.deck[randomIndex]);
    }

    renderCard(card) {
        this.container.innerHTML = card.html;
    }

    // Méthode utile pour plus tard (Carte Vengeance)
    getMostVotedPlayer() {
        // Retourne le joueur avec le plus de votes
        return Object.keys(this.voteCounts).reduce((a, b) => 
            this.voteCounts[a] > this.voteCounts[b] ? a : b
        );
    }

    cleanup() {
        delete window.nextRituelCard;
    }
}
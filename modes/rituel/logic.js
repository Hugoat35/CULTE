/* modes/rituel/logic.js */
import activeGames from './cards/index.js';

export default class RituelGame {
    constructor(players, container) {
        this.players = players;
        this.container = container;
        this.subGames = []; 
        this.voteCounts = {};
        
        // TEMPOREL
        this.turnCount = 0;       
        this.scheduledCards = {}; 

        // SYSTÈME DE POIDS POUR L'ÉQUILIBRAGE
        this.playerWeights = {}; 
    }

    start() {
        this.container.className = 'rituel-zone';
        
        // Initialisation :
        // 1. Votes à 0
        // 2. Poids à 100 pour tout le monde (chance égale au départ)
        this.players.forEach(name => {
            this.voteCounts[name] = 0;
            this.playerWeights[name] = 100;
        });

        this.buildDeck();

        // Gestionnaire d'animation & Vote
        const animateAndNext = (btnElement) => {
            // 1. VIBRATION "TIC" (Haptique léger lors du vote)
            if (navigator.vibrate) navigator.vibrate(20); 

            if (btnElement) {
                btnElement.classList.add('selected');
                const votedName = btnElement.innerText;
                if (this.voteCounts[votedName] !== undefined) this.voteCounts[votedName]++;
            }
            const currentCardEl = document.getElementById('current-card');
            setTimeout(() => {
                if (currentCardEl) {
                    currentCardEl.classList.add('card-exit');
                    setTimeout(() => this.nextCard(), 750);
                } else {
                    this.nextCard();
                }
            }, 800); 
        };
        
        window.nextRituelCard = (btn) => animateAndNext(btn);

        this.nextCard();
        this.attachGlobalListeners();
    }

    buildDeck() {
        activeGames.forEach(gameConfig => {
            const instance = new gameConfig.game(this.players);
            const config = instance.getConfig(); 
            const processedCards = config.data.map(item => {
                if(config.mode === 'virus') return { ...item, _config: config };
                const { text, options } = this.normalizeItem(item);
                return { options: options, rawText: text, _config: config };
            });
            this.subGames.push({ weight: gameConfig.weight, cards: processedCards, name: instance.constructor.name });
        });
    }

    normalizeItem(item) {
        if (typeof item === 'string') return { text: item, options: [] };
        return { text: item.text, options: item.options || [] };
    }

    nextCard() {
        this.turnCount++;

        // 1. Carte programmée (Fin de virus)
        if (this.scheduledCards[this.turnCount]) {
            const plannedCardHtml = this.scheduledCards[this.turnCount];
            delete this.scheduledCards[this.turnCount];
            this.container.innerHTML = plannedCardHtml;
            // Vérif taille texte après injection
            this.adjustTextSize();
            return;
        }

        // 2. Tirage du jeu
        const totalWeight = this.subGames.reduce((sum, g) => sum + g.weight, 0);
        let randomValue = Math.random() * totalWeight;
        let selectedGame = null;
        for (const game of this.subGames) {
            randomValue -= game.weight;
            if (randomValue <= 0) { selectedGame = game; break; }
        }
        if (!selectedGame) selectedGame = this.subGames[0];
        
        const randomCardIndex = Math.floor(Math.random() * selectedGame.cards.length);
        const cardData = selectedGame.cards[randomCardIndex];

        // 3. Gestion Virus ou Normal
        if (cardData._config.mode === 'virus') {
            this.handleVirusCard(cardData);
        } else {
            const html = this.generateHtml(cardData.rawText, cardData._config);
            const finalHtml = this.injectVariables(html, cardData.options);
            this.container.innerHTML = finalHtml;
            
            // AJOUT : On vérifie la taille du texte
            this.adjustTextSize();
        }
    }

    // --- LE CŒUR DE L'ÉQUILIBRAGE ---
    
    getBalancedPlayers(count) {
        // 1. SÉCURITÉ : On ne prend pas plus de joueurs qu'il n'y en a réellement
        const realCount = Math.min(count, this.players.length);

        let selectedPlayers = [];
        
        // Copie temporaire des poids pour ce tirage
        let tempWeights = { ...this.playerWeights };

        // 2. BOUCLE DE SÉLECTION
        for (let i = 0; i < realCount; i++) {
            
            // A. Calcul du poids total
            let totalWeight = 0;
            const candidates = this.players.filter(p => !selectedPlayers.includes(p)); 
            
            candidates.forEach(p => totalWeight += tempWeights[p]);

            // B. Tirage pondéré
            let random = Math.random() * totalWeight;
            let chosen = null;
            
            for (const player of candidates) {
                random -= tempWeights[player];
                if (random <= 0) {
                    chosen = player;
                    break;
                }
            }
            
            if (!chosen) chosen = candidates[0];
            selectedPlayers.push(chosen);
        }

        // 3. MISE À JOUR DES VRAIS POIDS
        this.players.forEach(p => {
            if (selectedPlayers.includes(p)) {
                // Reset à 40 pour laisser une chance de "Double Tap"
                this.playerWeights[p] = 40; 
            } else {
                // Les autres montent (+15)
                this.playerWeights[p] = Math.min(200, this.playerWeights[p] + 15);
            }
        });

        return selectedPlayers;
    }

    // --- OUTILS ---

    processVirusTexts(startStr, endStr) {
        const selectedPlayers = this.getBalancedPlayers(3); // Prend jusqu'à 3 joueurs équilibrés
        
        const replaceP = (str) => {
            return str.replace(/{p(\d+)}/g, (match, number) => {
                const index = parseInt(number) - 1;
                return selectedPlayers[index] ? `<span style="font-weight:800; color:var(--accent-color)">${selectedPlayers[index]}</span>` : "Quelqu'un";
            });
        };

        return {
            startText: replaceP(startStr),
            endText: replaceP(endStr)
        };
    }

    injectVariables(html, options) {
        let finalHtml = html;
        const selectedPlayers = this.getBalancedPlayers(3);

        // 1. Remplacement Joueurs {p1}, {p2}...
        finalHtml = finalHtml.replace(/{p(\d+)}/g, (match, number) => {
            const index = parseInt(number) - 1;
            return selectedPlayers[index] ? `<span style="font-weight:800; color:var(--accent-color)">${selectedPlayers[index]}</span>` : "Quelqu'un";
        });

        // 2. Remplacement Options {opt}
        if (options && options.length > 0) {
            finalHtml = finalHtml.replace(/{opt}/g, () => {
                const randomOption = options[Math.floor(Math.random() * options.length)];
                return `<span style="text-decoration:underline; text-decoration-color:var(--accent-color);">${randomOption}</span>`;
            });
        }

        // 3. Remplacement HARDCORE {loser} (Le plus voté)
        finalHtml = finalHtml.replace(/{loser}/g, () => {
            // On cherche le max de votes
            let maxVotes = -1;
            let losers = [];

            for (const [name, count] of Object.entries(this.voteCounts)) {
                if (count > maxVotes) {
                    maxVotes = count;
                    losers = [name]; // Nouveau record
                } else if (count === maxVotes) {
                    losers.push(name); // Égalité
                }
            }

            // Si personne n'a de vote (début de partie), on prend un joueur au hasard
            if (maxVotes <= 0) {
                const randomPlayer = this.players[Math.floor(Math.random() * this.players.length)];
                return `<span style="font-weight:800; color:#ff1744">${randomPlayer}</span>`;
            }

            // S'il y a des ex-aequo, on en tire un au sort
            const ultimateLoser = losers[Math.floor(Math.random() * losers.length)];
            return `<span style="font-weight:800; color:#ff1744; text-transform:uppercase;">${ultimateLoser}</span>`;
        });
        
        return this.injectDrink(finalHtml);
    }
    
    handleVirusCard(virusData) {
        // 1. VIBRATION ALERTE (Brrr - pause - Brrr)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        const config = virusData._config;
        const { startText, endText } = this.processVirusTexts(virusData.start, virusData.end);

        let startHtml = `
            <div class="rituel-card rituel-virus">
                <div class="rituel-category" style="background:${config.theme.bg}; color:${config.theme.color};">
                    ${config.theme.category}
                </div>
                <div class="rituel-content">${startText}</div>
                <div class="rituel-subtext" style="color:${config.theme.color}; font-weight:bold;">${config.subtext}</div>
            </div>
        `;
        startHtml = this.injectDrink(startHtml);

        const min = virusData.duration[0];
        const max = virusData.duration[1];
        const duration = Math.floor(Math.random() * (max - min + 1)) + min;
        const targetTurn = this.turnCount + duration;

        let endHtml = `
            <div class="rituel-card" style="border: 2px dashed ${config.theme.color}">
                <div class="rituel-category" style="background:#fff; color:${config.theme.color}; border:1px solid ${config.theme.color}">
                    FIN DE L'ALERTE
                </div>
                <div class="rituel-content">${endText}</div>
                <div class="rituel-subtext">La règle est levée.</div>
            </div>
        `;
        
        while(this.scheduledCards[targetTurn]) targetTurn++;
        this.scheduledCards[targetTurn] = endHtml;
        
        this.container.innerHTML = startHtml;
        
        // Vérif taille texte
        this.adjustTextSize();
    }

    injectDrink(html) {
        return html.replace(/{drink}/g, () => {
            const rand = Math.random(); 
            if (rand < 0.50) return "1 pénalité";
            else if (rand < 0.80) return "2 pénalités";
            else return "3 pénalités";
        });
    }

    // NOUVEAU : Ajuste la taille si le texte est trop long
    adjustTextSize() {
        const contentDiv = this.container.querySelector('.rituel-content');
        if (contentDiv) {
            // On compte le nombre de caractères (texte pur)
            const textLength = contentDiv.textContent.length;
            // Si + de 85 caractères, on ajoute la classe CSS .long-text
            if (textLength > 85) {
                contentDiv.classList.add('long-text');
            }
        }
    }

    generateHtml(text, config) {
        const theme = config.theme;
        if (config.mode === 'flip') {
            const playersHtml = this.players.map(p => 
                `<button class="vote-btn" onclick="event.stopPropagation(); window.nextRituelCard(this)">${p}</button>`
            ).join('');
            return `
                <div class="flip-container" id="current-card">
                    <div class="flip-inner">
                        <div class="flip-front">
                            <div class="rituel-category" style="background:${theme.bg}; color:${theme.color};">
                                ${theme.category}
                            </div>
                            <div class="rituel-content">${text}</div>
                            <div class="rituel-subtext">${config.subtext}</div>
                        </div>
                        <div class="flip-back">
                            <h3 style="font-size:1.2em; margin-bottom:10px;">Résultat du vote</h3>
                            <div class="vote-grid">${playersHtml}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="rituel-card">
                    <div class="rituel-category" style="background:${theme.bg}; color:${theme.color};">
                        ${theme.category}
                    </div>
                    <div class="rituel-content">${text}</div>
                    <div class="rituel-subtext" style="color:${theme.color}; font-weight:bold;">
                        ${config.subtext}
                    </div>
                </div>
            `;
        }
    }

    attachGlobalListeners() {
        this.container.addEventListener('click', (e) => {
            const cardEl = document.getElementById('current-card');
            const simpleCard = document.querySelector('.rituel-card:not(.flip-container)');
            
            // Empêche le clic si on touche un bouton ou si l'anim de sortie est en cours
            if(e.target.tagName === 'BUTTON' || (cardEl && cardEl.classList.contains('card-exit')) || (simpleCard && simpleCard.classList.contains('card-exit'))) return;

            if (cardEl) {
                cardEl.classList.toggle('flipped');
            } else if (simpleCard) {
                simpleCard.classList.add('card-exit');
                setTimeout(() => this.nextCard(), 750);
            }
        });
    }
    cleanup() { delete window.nextRituelCard; }
}
/* modes/rituel/logic.js */
import activeGames from './cards/index.js';
import { handleMiniGame } from './cards/jeux/logic.js'; 

export default class RituelGame {
    constructor(players, container) {
        this.players = players;
        this.mainContainer = container; 
        this.container = null;          
        this.virusContainer = null;     
        
        this.subGames = []; 
        this.voteCounts = {};
        
        this.turnCount = 0;       
        this.scheduledCards = {}; 
        this.activeViruses = []; 

        this.playerWeights = {}; 
    }

    start() {
        this.mainContainer.className = 'rituel-wrapper';
        this.mainContainer.innerHTML = `
            <div id="virus-area" class="hidden"></div>
            <div id="rituel-play-area" class="rituel-zone"></div>
        `;

        this.virusContainer = this.mainContainer.querySelector('#virus-area');
        this.container = this.mainContainer.querySelector('#rituel-play-area');

        this.players.forEach(name => {
            this.voteCounts[name] = 0;
            this.playerWeights[name] = 100;
        });

        this.buildDeck();

        // GESTIONNAIRE DE TRANSITION
        const animateAndNext = (btnElement, isInstant = false) => {
            if (navigator.vibrate) navigator.vibrate(20); 

            if (btnElement) {
                const btn = btnElement.closest('button');
                if (btn) {
                    btn.classList.add('selected');
                    const votedName = btn.innerText;
                    if (this.voteCounts[votedName] !== undefined) this.voteCounts[votedName]++;
                }
            }
            
            const currentCardEl = document.getElementById('current-card') || this.container.querySelector('.rituel-card');
            
            // Si c'est un mini-jeu (instant), pas de délai. Sinon (vote), on attend un peu pour voir le choix.
            const delayBeforeAnimation = isInstant ? 0 : 800; 
            const animationExitDuration = 750; 

            const performTransition = () => {
                if (currentCardEl) {
                    // Nettoyage des effets (shake) pour que l'anim de sortie fonctionne
                    currentCardEl.classList.remove('effect-shake'); 
                    void currentCardEl.offsetWidth; // Force Reflow

                    currentCardEl.classList.add('card-exit');
                    currentCardEl.style.animationDuration = '0.8s';
                    
                    setTimeout(() => this.nextCard(), animationExitDuration);
                } else {
                    this.nextCard();
                }
            };

            if (delayBeforeAnimation === 0) {
                performTransition();
            } else {
                setTimeout(performTransition, delayBeforeAnimation);
            }
        };
        
        // --- EXPOSITION DES FONCTIONS GLOBALES ---
        // 1. Pour les mini-jeux (Instant)
        window.nextRituelCard = (btn) => animateAndNext(btn, true);
        
        // 2. Pour les votes "Qui pourrait" (Avec délai) <- C'ETAIT CA QUI MANQUAIT
        window.voteRituelCard = (btn) => animateAndNext(btn, false);

        window.showVirusDetail = (virusId) => {
            const virus = this.activeViruses.find(v => v.id == virusId);
            if (virus) {
                let cleanMsg = virus.fullText.replace(/<[^>]*>?/gm, '');
                cleanMsg = this.injectDrink(cleanMsg);
                window.showCustomModal("Rappel du Virus 🦠", cleanMsg, null);
            }
        };

        this.nextCard();
        this.attachGlobalListeners();
    }

    buildDeck() {
        activeGames.forEach(gameConfig => {
            const instance = new gameConfig.game(this.players);
            const config = instance.getConfig(); 
            const cleanData = config.data.filter(item => item);

            const processedCards = cleanData.map(item => {
                if(config.mode === 'virus') return { ...item, _config: config };
                if(config.mode === 'minijeu') return { rawText: item, _config: config };
                
                const { text, options } = this.normalizeItem(item);
                return { options: options, rawText: text, _config: config };
            });
            
            if (processedCards.length > 0) {
                this.subGames.push({ weight: gameConfig.weight, cards: processedCards, name: instance.constructor.name });
            }
        });
    }

    normalizeItem(item) {
        if (typeof item === 'string') return { text: item, options: [] };
        return { text: item.text, options: item.options || [] };
    }

    nextCard() {
        this.turnCount++;

        if (this.scheduledCards[this.turnCount]) {
            const item = this.scheduledCards[this.turnCount];
            delete this.scheduledCards[this.turnCount];
            
            if (typeof item === 'object' && item.html) {
                this.container.innerHTML = item.html;
                if (item.onStart) item.onStart(); 
            } else {
                this.container.innerHTML = item; 
            }
            this.adjustTextSize();
            return;
        }

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

        if (cardData._config.mode === 'virus') {
            this.handleVirusCard(cardData);
        } 
        else if (cardData._config.mode === 'minijeu') {
            handleMiniGame(this, cardData);
        } 
        else {
            const html = this.generateHtml(cardData.rawText, cardData._config);
            const finalHtml = this.injectVariables(html, cardData.options);
            this.container.innerHTML = finalHtml;
            this.adjustTextSize();
        }
    }

    handleVirusCard(virusData) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        const config = virusData._config;
        const { startText, endText } = this.processVirusTexts(virusData.start, virusData.end);

        const virusId = Date.now() + Math.random(); 
        const cleanText = startText.replace(/<[^>]*>?/gm, ''); 
        const shortDesc = cleanText.length > 35 ? cleanText.substring(0, 32) + "..." : cleanText;

        this.activeViruses.push({
            id: virusId,
            text: shortDesc,
            fullText: startText 
        });
        this.updateVirusBar();

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
        this.container.innerHTML = startHtml;
        this.adjustTextSize();

        const min = virusData.duration[0];
        const max = virusData.duration[1];
        const duration = Math.floor(Math.random() * (max - min + 1)) + min;
        let targetTurn = this.turnCount + duration;

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

        this.scheduledCards[targetTurn] = {
            html: endHtml,
            onStart: () => {
                this.activeViruses = this.activeViruses.filter(v => v.id !== virusId);
                this.updateVirusBar();
            }
        };
    }

    updateVirusBar() {
        if (this.activeViruses.length === 0) {
            this.virusContainer.classList.add('hidden');
            this.virusContainer.innerHTML = '';
            return;
        }

        this.virusContainer.classList.remove('hidden');
        const badgesHtml = this.activeViruses.map(v => `
            <div class="virus-badge" onclick="window.showVirusDetail(${v.id})">
                <span class="virus-icon">☣️</span>
                <span class="virus-desc">${v.text}</span>
            </div>
        `).join('');

        this.virusContainer.innerHTML = `<div class="virus-scroller">${badgesHtml}</div>`;
        
        const scroller = this.virusContainer.querySelector('.virus-scroller');
        if (scroller) {
            scroller.addEventListener('wheel', (evt) => {
                evt.preventDefault();
                scroller.scrollLeft += evt.deltaY;
            });
        }
    }
    
    getBalancedPlayers(count) {
        const realCount = Math.min(count, this.players.length);
        let selectedPlayers = [];
        let tempWeights = { ...this.playerWeights };

        for (let i = 0; i < realCount; i++) {
            let totalWeight = 0;
            const candidates = this.players.filter(p => !selectedPlayers.includes(p)); 
            candidates.forEach(p => totalWeight += tempWeights[p]);

            let random = Math.random() * totalWeight;
            let chosen = null;
            for (const player of candidates) {
                random -= tempWeights[player];
                if (random <= 0) { chosen = player; break; }
            }
            if (!chosen) chosen = candidates[0];
            selectedPlayers.push(chosen);
        }

        this.players.forEach(p => {
            if (selectedPlayers.includes(p)) this.playerWeights[p] = 40; 
            else this.playerWeights[p] = Math.min(200, this.playerWeights[p] + 15);
        });

        return selectedPlayers;
    }

    processVirusTexts(startStr, endStr) {
        const selectedPlayers = this.getBalancedPlayers(3); 
        const replaceP = (str) => {
            return str.replace(/{p(\d+)}/g, (match, number) => {
                const index = parseInt(number) - 1;
                return selectedPlayers[index] ? `<span style="font-weight:800; color:var(--accent-color)">${selectedPlayers[index]}</span>` : "Quelqu'un";
            });
        };
        return { startText: replaceP(startStr), endText: replaceP(endStr) };
    }

    injectVariables(html, options) {
        let finalHtml = html;
        const selectedPlayers = this.getBalancedPlayers(3);

        finalHtml = finalHtml.replace(/{p(\d+)}/g, (match, number) => {
            const index = parseInt(number) - 1;
            return selectedPlayers[index] ? `<span style="font-weight:800; color:var(--accent-color)">${selectedPlayers[index]}</span>` : "Quelqu'un";
        });

        if (options && options.length > 0) {
            finalHtml = finalHtml.replace(/{opt}/g, () => {
                const randomOption = options[Math.floor(Math.random() * options.length)];
                return `<span style="text-decoration:underline; text-decoration-color:var(--accent-color);">${randomOption}</span>`;
            });
        }

        finalHtml = finalHtml.replace(/{loser}/g, () => {
            let maxVotes = -1;
            let losers = [];
            for (const [name, count] of Object.entries(this.voteCounts)) {
                if (count > maxVotes) { maxVotes = count; losers = [name]; } 
                else if (count === maxVotes) { losers.push(name); }
            }
            if (maxVotes <= 0) return `<span style="font-weight:800; color:#ff1744">${this.players[Math.floor(Math.random() * this.players.length)]}</span>`;
            const ultimateLoser = losers[Math.floor(Math.random() * losers.length)];
            return `<span style="font-weight:800; color:#ff1744; text-transform:uppercase;">${ultimateLoser}</span>`;
        });
        
        return this.injectDrink(finalHtml);
    }
    
    injectDrink(html) {
        return html.replace(/{drink}/g, () => {
            const rand = Math.random(); 
            if (rand < 0.50) return "1 pénalité";
            else if (rand < 0.80) return "2 pénalités";
            else return "3 pénalités";
        });
    }

    adjustTextSize() {
        const contentDiv = this.container.querySelector('.rituel-content');
        if (contentDiv) {
            const textLength = contentDiv.textContent.length;
            if (textLength > 85) contentDiv.classList.add('long-text');
        }
    }

    generateHtml(text, config) {
        const theme = config.theme;
        if (config.mode === 'flip') {
            const playersHtml = this.players.map(p => 
                // CORRECTION ICI : Appel de window.voteRituelCard
                `<button class="vote-btn" onclick="event.stopPropagation(); window.voteRituelCard(this)">${p}</button>`
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
            
            if(e.target.closest('button') || e.target.closest('#virus-area')) return;
            
            if ((cardEl && cardEl.classList.contains('card-exit')) || (simpleCard && simpleCard.classList.contains('card-exit'))) return;

            if (cardEl) {
                cardEl.classList.toggle('flipped');
            } else if (simpleCard) {
                simpleCard.classList.remove('effect-shake'); 
                void simpleCard.offsetWidth;

                simpleCard.classList.add('card-exit');
                setTimeout(() => this.nextCard(), 750);
            }
        });
    }
    
    cleanup() { 
        delete window.nextRituelCard; 
        delete window.voteRituelCard; // Nettoyage
        delete window.showVirusDetail; 
    }
}
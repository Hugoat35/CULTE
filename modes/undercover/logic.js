/* modes/undercover/logic.js */
import { words } from './data.js';

export default class UndercoverGame {
    constructor(players, container) {
        this.players = players;
        this.container = container;
        this.container.className = '';
        
        // Configuration par défaut selon le nombre de joueurs
        this.config = this.getIdealConfig(players.length);
        
        this.assignments = [];
        this.currentPlayerIndex = 0;
        this.secretWord = ""; 
        this.starterPlayer = null; // Stockera celui qui commence le débat
    }

    // --- CALCUL DE L'IDÉAL ---
    getIdealConfig(totalPlayers) {
        if (totalPlayers === 3) {
            return { undercover: 1, mrWhite: 0 }; // 3 joueurs : Pas de Mr White possible
        }
        else if (totalPlayers <= 5) {
            return { undercover: 1, mrWhite: 0 };
        } 
        else if (totalPlayers <= 6) {
            return { undercover: 1, mrWhite: 1 };
        } 
        else if (totalPlayers <= 8) {
            return { undercover: 2, mrWhite: 1 };
        } 
        else {
            return { undercover: 3, mrWhite: 1 };
        }
    }

    start() { this.renderSettings(); }

    renderSettings() {
        // Calcul du max de méchants (la moitié des joueurs - 1 pour garder une majorité)
        const maxBadGuys = Math.max(1, Math.floor((this.players.length - 1) / 2));

        this.container.innerHTML = `
            <h2>Configuration</h2>
            <div style="display:flex; justify-content:space-around; margin:20px 0; text-align:center;">
                <div style="background:#e3f2fd; padding:10px; border-radius:15px; width:45%;">
                    <div style="font-size:1.5em;">😇</div>
                    <div style="font-weight:bold; color:#1e88e5;" id="count-civils">?</div>
                    <small>Civils</small>
                </div>
                <div style="background:#ffebee; padding:10px; border-radius:15px; width:45%;">
                    <div style="font-size:1.5em;">😈</div>
                    <div style="font-weight:bold; color:#e53935;" id="count-baddies">?</div>
                    <small>Intrus</small>
                </div>
            </div>

            <div class="settings-row">
                <span>🕵️ Undercover</span>
                <div class="counter-box">
                    <button class="counter-btn" id="sub-uc">-</button>
                    <span class="counter-val" id="val-uc">${this.config.undercover}</span>
                    <button class="counter-btn" id="add-uc">+</button>
                </div>
            </div>

            <div class="settings-row">
                <span>👻 Mr. White</span>
                <div class="counter-box">
                    <button class="counter-btn" id="sub-mw">-</button>
                    <span class="counter-val" id="val-mw">${this.config.mrWhite}</span>
                    <button class="counter-btn" id="add-mw">+</button>
                </div>
            </div>

            <p id="slots-msg" style="font-size:0.9em; color:#888; margin-top:10px;"></p>
            <button id="launch-btn" class="main-btn" style="margin-top:20px">Lancer la partie</button>
        `;

        const updateUI = () => {
            // SÉCURITÉ 3 JOUEURS DANS L'UI
            if (this.players.length === 3) {
                this.config.mrWhite = 0; // On force à 0
                if(this.config.undercover === 0) this.config.undercover = 1;
            }

            const nbUc = this.config.undercover;
            const nbMw = this.config.mrWhite;
            const totalBad = nbUc + nbMw;
            const totalCivils = this.players.length - totalBad;
            const slotsLeft = maxBadGuys - totalBad;

            document.getElementById('val-uc').innerText = nbUc;
            document.getElementById('val-mw').innerText = nbMw;
            document.getElementById('count-civils').innerText = totalCivils;
            document.getElementById('count-baddies').innerText = totalBad;

            // Désactiver les boutons si 3 joueurs
            if (this.players.length === 3) {
                 document.getElementById('add-mw').disabled = true;
                 document.getElementById('add-mw').style.opacity = 0.3;
            }

            const msgEl = document.getElementById('slots-msg');
            if (this.players.length === 3) {
                msgEl.innerText = "À 3 joueurs, Mr. White est désactivé.";
                msgEl.style.color = "#888";
            } else if (slotsLeft === 0) {
                msgEl.innerText = "⚠️ Maximum d'intrus atteint";
                msgEl.style.color = "#ff9800";
            } else {
                msgEl.innerText = `Encore ${slotsLeft} place(s) pour les intrus.`;
                msgEl.style.color = "#888";
            }

            const btn = document.getElementById('launch-btn');
            if(totalBad > maxBadGuys || totalBad === 0) {
                btn.disabled = true;
                btn.innerText = totalBad === 0 ? "Il faut un intrus" : "Trop d'intrus";
                btn.style.opacity = "0.5";
            } else {
                btn.disabled = false;
                btn.innerText = "Lancer la partie";
                btn.style.opacity = "1";
            }
        };

        this.container.querySelector('#add-uc').onclick = () => {
            const total = this.config.undercover + this.config.mrWhite;
            if (total < maxBadGuys) {
                this.config.undercover++;
            } else if (total === maxBadGuys && this.config.mrWhite > 0) {
                this.config.mrWhite--; this.config.undercover++;
            }
            updateUI();
        };
        this.container.querySelector('#sub-uc').onclick = () => { if(this.config.undercover > 0) this.config.undercover--; updateUI(); };
        
        this.container.querySelector('#add-mw').onclick = () => { 
            if (this.players.length === 3) return; // Bloqué à 3 joueurs
            const total = this.config.undercover + this.config.mrWhite;
            if (total < maxBadGuys) {
                this.config.mrWhite++;
            } else if (total === maxBadGuys && this.config.undercover > 0) {
                this.config.undercover--; this.config.mrWhite++;
            }
            updateUI(); 
        };
        this.container.querySelector('#sub-mw').onclick = () => { if(this.config.mrWhite > 0) this.config.mrWhite--; updateUI(); };
        this.container.querySelector('#launch-btn').onclick = () => this.setupGame();
        
        updateUI();
    }

    setupGame() {
        // --- 1. SÉCURITÉ FORCEE AVANT LANCEMENT ---
        if (this.players.length === 3) {
            this.config.mrWhite = 0;
            if (this.config.undercover === 0) this.config.undercover = 1;
        }

        // --- 2. CHOIX ET PRÉPARATION DES MOTS ---
        const rawPair = words[Math.floor(Math.random() * words.length)];
        
        let civWord = rawPair.civil;
        let ucWord = rawPair.undercover;

        // --- GESTION DES PLACEHOLDERS {p1} et {p2} ---
        if (civWord.includes('{p1}') || ucWord.includes('{p1}') || civWord.includes('{p2}') || ucWord.includes('{p2}')) {
            // On tire 2 joueurs au hasard parmi les présents
            // On utilise une copie pour ne pas modifier l'ordre du jeu
            const shuffledNames = [...this.players].sort(() => 0.5 - Math.random());
            const p1 = shuffledNames[0];
            const p2 = shuffledNames[1];

            // Remplacement global
            const replacePlaceholders = (text) => {
                return text.replace(/{p1}/g, p1).replace(/{p2}/g, p2);
            };

            civWord = replacePlaceholders(civWord);
            ucWord = replacePlaceholders(ucWord);
        }

        // --- 3. SWAP ALÉATOIRE (Qui a quel mot ?) ---
        // 50% de chance d'inverser pour que le 1er mot de data.js ne soit pas toujours Civil
        const swap = Math.random() < 0.5;
        
        // Comme on a déjà remplacé les prénoms, on assigne les chaînes finales
        const finalCivilWord = swap ? ucWord : civWord;
        const finalUcWord = swap ? civWord : ucWord;

        this.secretWord = finalCivilWord; 

        // Création des rôles
        let roles = [];
        for(let i=0; i<this.config.undercover; i++) roles.push({ type: 'Undercover', word: finalUcWord });
        for(let i=0; i<this.config.mrWhite; i++) roles.push({ type: 'Mr. White', word: null });
        const nbCivils = this.players.length - roles.length;
        for(let i=0; i<nbCivils; i++) roles.push({ type: 'Civil', word: finalCivilWord });

        // Mélange des rôles
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }

        // Assignation aux joueurs
        this.assignments = this.players.map((name, index) => ({
            name: name,
            role: roles[index].type,
            word: roles[index].word,
            alive: true,
            originalIndex: index
        }));

        // --- 4. CHOIX DU JOUEUR QUI COMMENCE LE DÉBAT ---
        // On choisit un joueur au hasard
        let startIndex = Math.floor(Math.random() * this.assignments.length);
        
        // TANT QUE c'est Mr. White, on passe au suivant (pour ne pas qu'il commence sans mot)
        while (this.assignments[startIndex].role === 'Mr. White') {
            startIndex = (startIndex + 1) % this.assignments.length;
        }
        
        this.starterPlayer = this.assignments[startIndex];

        this.currentPlayerIndex = 0; // Pour le passage du téléphone (0 à N)
        this.showPassPhoneScreen();
    }

    showPassPhoneScreen() {
        if (this.currentPlayerIndex >= this.assignments.length) {
            this.showDebatePhase();
            return;
        }
        const player = this.assignments[this.currentPlayerIndex];
        this.container.innerHTML = `
            <h2>Au tour de <br><strong style="font-size:1.5em; color:var(--accent-color)">${player.name}</strong></h2>
            <div style="font-size:3em; margin: 20px 0;">🤫</div>
            <p>Passe le téléphone à ${player.name}.</p>
            <button id="reveal-btn" class="main-btn" style="margin-top:30px">Voir mon mot</button>
        `;
        this.container.querySelector('#reveal-btn').onclick = () => this.showSecretScreen(player);
    }

    showSecretScreen(player) {
        let content = "";
        if (player.role === 'Mr. White') {
            content = `
                <p>Tu es</p>
                <div class="word-display" style="color:#333; border-color:#333;">Mr. White 👻</div>
                <p>Tu n'as pas de mot.<br>Imite les autres !</p>
            `;
        } else {
            content = `
                <p>Ton mot secret :</p>
                <div class="word-display">${player.word}</div>
                <p>Mémorise-le bien.</p>
            `;
        }
        this.container.innerHTML = `
            ${content}
            <button id="hide-btn" class="main-btn" style="margin-top:20px">C'est bon, j'ai vu</button>
        `;
        this.container.querySelector('#hide-btn').onclick = () => {
            this.currentPlayerIndex++;
            this.showPassPhoneScreen();
        };
    }

    showDebatePhase() {
        const alivePlayers = this.assignments.filter(p => p.alive);
        
        // Si le joueur qui devait commencer est mort (tours suivants), on en prend un autre en vie
        if (!this.starterPlayer || !this.starterPlayer.alive) {
            this.starterPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        }

        this.container.innerHTML = `
            <div style="font-size:3em">🗣️</div>
            <h2>Débattez !</h2>
            <p><strong>${this.starterPlayer.name}</strong> commence.</p>
            
            <h3>Qui voulez-vous éliminer ?</h3>
            <ul class="elimination-list">
                ${this.assignments.map((p, idx) => `
                    <li class="player-row ${!p.alive ? 'dead' : ''}" onclick="window.handleEliminate(${idx})">
                        <span>${!p.alive ? '💀 ' : ''}${p.name}</span>
                        ${!p.alive ? `<span class="${p.role === 'Civil' ? 'role-safe' : 'role-reveal'}">${p.role === 'Mr. White' ? 'Mr. White' : p.role}</span>` : '<span>👉</span>'}
                    </li>
                `).join('')}
            </ul>

            <button id="review-btn" class="secondary-btn" style="margin-top:20px; font-size:0.9em;">
                👀 J'ai oublié mon mot
            </button>
        `;

        window.handleEliminate = (index) => {
            window.showCustomModal(
                "Éliminer ce joueur ?",
                `Vote contre ${this.assignments[index].name} ?`,
                () => this.eliminatePlayer(index)
            );
        };

        this.container.querySelector('#review-btn').onclick = () => this.handleReviewWord();
    }

    handleReviewWord() {
        const alivePlayers = this.assignments.filter(p => p.alive);
        
        let html = `
            <h2>Qui es-tu ?</h2>
            <p>Sélectionne ton prénom.</p>
            <div class="players-grid" style="justify-content:center; gap:15px; margin-top:20px;">`;
            
        alivePlayers.forEach(p => {
            html += `<button class="main-btn" style="background:white; color:var(--text-color); border:2px solid #eee;" 
                    onclick="window.checkIdentity(${p.originalIndex})">${p.name}</button>`;
        });

        html += `</div>
            <button id="cancel-review" class="secondary-btn">Annuler</button>
        `;

        this.container.innerHTML = html;

        this.container.querySelector('#cancel-review').onclick = () => this.showDebatePhase();

        window.checkIdentity = (originalIndex) => {
            const player = this.assignments[originalIndex];
            
            this.container.innerHTML = `
                <h2>Sécurité</h2>
                <div style="font-size:3em; margin:20px 0;">🤫</div>
                <p>Passe le téléphone à <strong>${player.name}</strong>.</p>
                <p>Assure-toi que personne ne regarde.</p>
                
                <button id="show-reminder-btn" class="main-btn" style="margin-top:30px">Afficher le mot</button>
                <button id="cancel-reminder" class="secondary-btn">Annuler</button>
            `;

            this.container.querySelector('#cancel-reminder').onclick = () => this.showDebatePhase();
            this.container.querySelector('#show-reminder-btn').onclick = () => {
                let secretContent = "";
                if (player.role === 'Mr. White') {
                    secretContent = `<div class="word-display" style="color:#333; border-color:#333;">Mr. White 👻</div>`;
                } else {
                    secretContent = `<div class="word-display">${player.word}</div>`;
                }

                this.container.innerHTML = `
                    <h2>Rappel</h2>
                    <p>Ton mot est :</p>
                    ${secretContent}
                    <button id="back-to-vote" class="main-btn">Retour au vote</button>
                `;
                this.container.querySelector('#back-to-vote').onclick = () => this.showDebatePhase();
            };
        };
    }

    eliminatePlayer(index) {
        const player = this.assignments[index];
        
        if (player.role === 'Mr. White') {
            this.showMrWhiteGuessScreen(player, index);
            return;
        }

        this.confirmElimination(index);
    }

    showMrWhiteGuessScreen(player, index) {
        this.container.innerHTML = `
            <div style="font-size:3em">👻</div>
            <h2>Mr. White démasqué !</h2>
            <p><strong>${player.name}</strong>, tu as une dernière chance.</p>
            <p>Devine le mot des Civils pour voler la victoire !</p>
            
            <div class="input-container" style="margin-top:20px;">
                <input type="text" id="white-guess" placeholder="Quel est le mot ?" autocomplete="off">
            </div>

            <button id="validate-guess" class="main-btn">Valider</button>
        `;

        this.container.querySelector('#validate-guess').onclick = () => {
            const guess = document.getElementById('white-guess').value.trim();
            if(!guess) return;

            const cleanGuess = guess.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const cleanSecret = this.secretWord.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (cleanGuess === cleanSecret) {
                player.alive = false; 
                this.showEndScreen("Victoire de Mr. White ! 👻", `Il a trouvé le mot caché : <strong>${this.secretWord}</strong>`);
            } else {
                window.showCustomModal(
                    "Raté !",
                    `Le mot était "${this.secretWord}".`,
                    () => this.confirmElimination(index)
                );
            }
        };
    }

    confirmElimination(index) {
        const player = this.assignments[index];
        player.alive = false;

        this.container.innerHTML = `
            <h2>${player.name} était...</h2>
            <div class="word-display" style="${player.role === 'Civil' ? 'color:#2ecc71; border-color:#2ecc71' : 'color:var(--accent-color)'}">
                ${player.role === 'Mr. White' ? 'Mr. White 👻' : player.role}
            </div>
            ${player.role === 'Civil' ? '<p>Oups... Vous avez éliminé un innocent.</p>' : '<p>Bien joué ! Un intrus en moins.</p>'}
            
            <button id="next-step-btn" class="main-btn">Continuer</button>
        `;
        this.container.querySelector('#next-step-btn').onclick = () => this.checkWinCondition();
    }

    checkWinCondition() {
        const aliveCivils = this.assignments.filter(p => p.alive && p.role === 'Civil').length;
        const totalBad = this.assignments.filter(p => p.alive && (p.role === 'Undercover' || p.role === 'Mr. White')).length;

        if (totalBad === 0) {
            this.showEndScreen('Victoire des Civils ! 🎉', 'Tous les intrus ont été éliminés.');
        } else if (totalBad >= aliveCivils) {
            this.showEndScreen('Victoire des Imposteurs ! 😈', 'Les imposteurs ont pris le contrôle.');
        } else {
            this.showDebatePhase();
        }
    }

    showEndScreen(title, subtitle) {
        let html = `
            <h2 style="font-size:2em; margin-bottom:10px">${title}</h2>
            <p>${subtitle}</p>
            <ul class="elimination-list" style="margin-top:30px">`;
        
        this.assignments.forEach(p => {
            const roleColor = p.role === 'Civil' ? '#2ecc71' : 'var(--accent-color)';
            const displayWord = p.role === 'Mr. White' ? '👻' : p.word;
            
            html += `
                <li class="player-row" style="cursor:default">
                    <span>${p.name}</span>
                    <strong style="color:${roleColor}">${p.role} (${displayWord})</strong>
                </li>
            `;
        });

        html += `</ul>
            <button id="restart-btn" class="main-btn" style="margin-top:20px">Rejouer</button>
            <button id="quit-btn" class="secondary-btn">Changer de jeu</button>
        `;
        
        this.container.innerHTML = html;
        this.container.querySelector('#restart-btn').onclick = () => this.start();
        
        // CORRECTION ICI : Utilisation de la navigation propre
        this.container.querySelector('#quit-btn').onclick = () => {
             if (window.returnToSelection) {
                 window.returnToSelection();
             } else {
                 // Fallback si la fonction n'est pas encore chargée
                 this.container.innerHTML = '';
                 document.getElementById('screen-game').classList.add('hidden');
                 document.getElementById('screen-selection').classList.remove('hidden');
                 document.getElementById('screen-selection').classList.add('active');
             }
        };
    }
}
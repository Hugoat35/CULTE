import { words } from './data.js';

export default class UndercoverGame {
    constructor(players, container) {
        this.players = players;
        this.container = container;
        this.config = { undercover: 1, mrWhite: 0 };
        this.assignments = [];
        this.currentPlayerIndex = 0;
        this.secretWord = ""; // Le mot des Civils pour cette partie
    }

    start() { this.renderSettings(); }

    renderSettings() {
        const maxBadGuys = Math.floor((this.players.length - 1) / 2);

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
                    <span class="counter-val" id="val-uc">1</span>
                    <button class="counter-btn" id="add-uc">+</button>
                </div>
            </div>

            <div class="settings-row">
                <span>👻 Mr. White</span>
                <div class="counter-box">
                    <button class="counter-btn" id="sub-mw">-</button>
                    <span class="counter-val" id="val-mw">0</span>
                    <button class="counter-btn" id="add-mw">+</button>
                </div>
            </div>

            <p id="slots-msg" style="font-size:0.9em; color:#888; margin-top:10px;"></p>
            <button id="launch-btn" class="main-btn" style="margin-top:20px">Lancer la partie</button>
        `;

        const updateUI = () => {
            const nbUc = this.config.undercover;
            const nbMw = this.config.mrWhite;
            const totalBad = nbUc + nbMw;
            const totalCivils = this.players.length - totalBad;
            const slotsLeft = maxBadGuys - totalBad;

            document.getElementById('val-uc').innerText = nbUc;
            document.getElementById('val-mw').innerText = nbMw;
            document.getElementById('count-civils').innerText = totalCivils;
            document.getElementById('count-baddies').innerText = totalBad;

            const msgEl = document.getElementById('slots-msg');
            if (slotsLeft === 0) {
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

        // Logic Auto-Balance
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

    // --- MODIFICATION ICI : SYSTEME DE PILE OU FACE ---
    setupGame() {
        // 1. Choix de la paire
        const rawPair = words[Math.floor(Math.random() * words.length)];

        // 2. Pile ou Face pour inverser les rôles (Anti-Méta)
        // Si true, on inverse. 
        const swap = Math.random() < 0.5;
        
        const wordCivil = swap ? rawPair.undercover : rawPair.civil;
        const wordUndercover = swap ? rawPair.civil : rawPair.undercover;

        // On sauvegarde le vrai mot civil (pour Mr White)
        this.secretWord = wordCivil; 

        let roles = [];

        // Assignation des Undercover avec le mot aléatoire
        for(let i=0; i<this.config.undercover; i++) roles.push({ type: 'Undercover', word: wordUndercover });
        
        // Assignation des Mr. White
        for(let i=0; i<this.config.mrWhite; i++) roles.push({ type: 'Mr. White', word: null });
        
        // Assignation des Civils avec le mot aléatoire
        const nbCivils = this.players.length - roles.length;
        for(let i=0; i<nbCivils; i++) roles.push({ type: 'Civil', word: wordCivil });

        // Mélange des joueurs
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }

        this.assignments = this.players.map((name, index) => ({
            name: name,
            role: roles[index].type,
            word: roles[index].word,
            alive: true,
            originalIndex: index
        }));

        this.currentPlayerIndex = 0;
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
        const starter = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

        this.container.innerHTML = `
            <div style="font-size:3em">🗣️</div>
            <h2>Débattez !</h2>
            <p><strong>${starter.name}</strong> commence.</p>
            <h3>Qui voulez-vous éliminer ?</h3>
            <ul class="elimination-list">
                ${this.assignments.map((p, idx) => `
                    <li class="player-row ${!p.alive ? 'dead' : ''}" onclick="window.handleEliminate(${idx})">
                        <span>${!p.alive ? '💀 ' : ''}${p.name}</span>
                        ${!p.alive ? `<span class="${p.role === 'Civil' ? 'role-safe' : 'role-reveal'}">${p.role === 'Mr. White' ? 'Mr. White' : p.role}</span>` : '<span>👉</span>'}
                    </li>
                `).join('')}
            </ul>
        `;

        window.handleEliminate = (index) => {
            window.showCustomModal(
                "Éliminer ce joueur ?",
                `Vote contre ${this.assignments[index].name} ?`,
                () => this.eliminatePlayer(index)
            );
        };
    }

    eliminatePlayer(index) {
        const player = this.assignments[index];
        
        if (player.role === 'Mr. White') {
            this.showMrWhiteGuessScreen(player, index);
            return;
        }

        // Élimination standard
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
        this.container.querySelector('#quit-btn').onclick = () => {
             this.container.innerHTML = '';
             document.getElementById('screen-game').classList.add('hidden');
             document.getElementById('screen-selection').classList.remove('hidden');
             document.getElementById('screen-selection').classList.add('active');
        };
    }
}
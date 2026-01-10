/* modes/fakeit/logic.js */
import { questions } from './data.js';

export default class FakeItGame {
    constructor(players, container) {
        this.players = players;
        this.container = container;
        this.scores = {};
        players.forEach(p => this.scores[p] = 0);

        this.currentQuestion = null;
        this.bluffers = []; 
        this.guessers = []; 
        this.fakes = []; 
        this.votes = {}; 
    }

    start() {
        this.nextRound();
    }

    nextRound() {
        // 1. Choix question
        this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        this.fakes = [];
        this.votes = {};

        // 2. Répartition des rôles
        let shuffled = [...this.players].sort(() => 0.5 - Math.random());
        
        // Règle : Max 3 bluffeurs, mais on laisse au moins 1 devin.
        const maxBluffers = Math.min(3, this.players.length - 1);
        const nbBluffers = Math.max(1, Math.floor(Math.random() * maxBluffers) + 1);

        this.bluffers = shuffled.slice(0, nbBluffers);
        this.guessers = shuffled.slice(nbBluffers);

        this.startBluffingPhase(0);
    }

    // --- PHASE 1 : ECRITURE DES FAUSSES REPONSES ---

    startBluffingPhase(index) {
        if (index >= this.bluffers.length) {
            this.startVotingPhase(0);
            return;
        }

        const player = this.bluffers[index];
        
        this.container.innerHTML = `
            <div style="font-size:3em; margin-bottom:10px;">🤫</div>
            <h2>Au Bluffeur</h2>
            <p>Passez le téléphone à <strong style="color:var(--accent-color); font-size:1.2em;">${player}</strong>.</p>
            <p style="margin-top:20px; font-size:0.9em; opacity:0.7;">Les autres, ne regardez pas !</p>
            <button class="main-btn" style="margin-top:30px">C'est moi, je suis prêt</button>
        `;

        this.container.querySelector('button').onclick = () => {
            this.showInputScreen(index);
        };
    }

    showInputScreen(index) {
        const player = this.bluffers[index];
        const q = this.currentQuestion;

        this.container.innerHTML = `
            <div style="background:#fff3e0; padding:15px; border-radius:15px; border:2px solid #ffb74d; margin-bottom:20px;">
                <p style="font-size:0.8em; color:#f57c00; font-weight:bold;">LA QUESTION :</p>
                <p style="font-weight:bold;">${q.q}</p>
                <hr style="border:0; border-top:1px solid #ffcc80; margin:10px 0;">
                <p style="font-size:0.8em; color:#2e7d32; font-weight:bold;">LA VRAIE RÉPONSE :</p>
                <p style="font-weight:800; color:#2e7d32;">${q.a}</p>
            </div>

            <p>Invente une réponse crédible pour piéger les autres :</p>
            
            <div class="input-container" style="margin: 20px 0;">
                <input type="text" id="fake-input" placeholder="Ta fausse réponse..." autocomplete="off">
            </div>

            <button class="main-btn" id="validate-fake">Valider</button>
        `;

        const btn = this.container.querySelector('#validate-fake');
        const input = this.container.querySelector('#fake-input');

        const validate = () => {
            const val = input.value.trim();
            if (!val) return;
            // On s'assure qu'il ne tape pas la vraie réponse
            if (val.toLowerCase() === q.a.toLowerCase()) {
                alert("Tu ne peux pas mettre la vraie réponse ! Tu dois mentir !");
                return;
            }
            
            this.fakes.push({ author: player, text: val });
            this.startBluffingPhase(index + 1);
        };

        btn.onclick = validate;
    }

    // --- PHASE 2 : VOTE DES DEVINS ---

    startVotingPhase(index) {
        if (index >= this.guessers.length) {
            this.revealPhase();
            return;
        }

        const player = this.guessers[index];

        if (!this.mixedOptions) {
            this.mixedOptions = [
                { type: 'real', text: this.currentQuestion.a },
                ...this.fakes.map(f => ({ type: 'fake', text: f.text, author: f.author }))
            ].sort(() => 0.5 - Math.random());
        }

        this.container.innerHTML = `
            <div style="font-size:3em; margin-bottom:10px;">🕵️‍♂️</div>
            <h2>Au Devin</h2>
            <p>Passez le téléphone à <strong style="color:var(--accent-color);">${player}</strong>.</p>
            <button class="main-btn" style="margin-top:30px">Je suis prêt</button>
        `;

        this.container.querySelector('button').onclick = () => {
            this.showVotingScreen(index);
        };
    }

    showVotingScreen(index) {
        const player = this.guessers[index];
        
        const optionsHtml = this.mixedOptions.map((opt, i) => `
            <button class="vote-btn option-btn" data-idx="${i}" style="width:100%; margin-bottom:10px; font-size:1em;">
                ${opt.text}
            </button>
        `).join('');

        this.container.innerHTML = `
            <h3>${this.currentQuestion.q}</h3>
            <p style="font-size:0.9em; margin-bottom:20px;">Quelle est la vraie réponse ?</p>
            
            <div style="width:100%;">${optionsHtml}</div>
        `;

        this.container.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => {
                const choiceIdx = btn.dataset.idx;
                const choice = this.mixedOptions[choiceIdx];
                this.votes[player] = choice;
                this.startVotingPhase(index + 1);
            };
        });
    }

    // --- PHASE 3 : RÉVÉLATION & SCORES ---

    revealPhase() {
        let logs = [];

        this.guessers.forEach(guesser => {
            const vote = this.votes[guesser];
            if (vote.type === 'real') {
                this.scores[guesser] += 1;
                logs.push(`<span style="color:#2e7d32">✔ <strong>${guesser}</strong> a trouvé (+1)</span>`);
            } else {
                this.scores[vote.author] += 2;
                logs.push(`<span style="color:#c62828">✖ <strong>${guesser}</strong> s'est fait avoir par <strong>${vote.author}</strong> (+2)</span>`);
            }
        });

        const resultsHtml = this.mixedOptions.map(opt => {
            let style = "background:#f4f6f8; color:#333;";
            let details = "";

            if (opt.type === 'real') {
                style = "background:#2e7d32; color:white; border:2px solid #1b5e20;";
                details = " (VRAIE)";
            } else {
                const voters = this.guessers.filter(g => this.votes[g] === opt);
                if (voters.length > 0) {
                    style = "background:#ffcdd2; color:#b71c1c; border:2px solid #b71c1c;";
                    details = `<br><span style="font-size:0.8em">Bluff de <strong>${opt.author}</strong></span>`;
                }
            }
            return `<div style="${style} padding:10px; border-radius:10px; margin-bottom:5px; font-weight:bold;">${opt.text}${details}</div>`;
        }).join('');

        this.container.innerHTML = `
            <h2>Résultats</h2>
            <div style="margin:20px 0; text-align:left; width:100%;">${resultsHtml}</div>
            
            <div style="background:white; padding:15px; border-radius:15px; font-size:0.9em; text-align:left; border:1px solid #eee;">
                ${logs.join('<br>')}
            </div>

            <div style="display:flex; gap:10px; margin-top:20px; width:100%;">
                <button id="next-round" class="main-btn" style="flex:1;">Continuer</button>
                <button id="quit-game" class="secondary-btn" style="flex:1; margin-top:0;">Quitter</button>
            </div>
        `;

        this.mixedOptions = null;

        this.container.querySelector('#next-round').onclick = () => this.nextRound();
        this.container.querySelector('#quit-game').onclick = () => {
            this.showFinalScore();
        };
    }

    showFinalScore() {
        // Tri des scores
        const sorted = Object.entries(this.scores).sort((a,b) => b[1] - a[1]);
        const html = sorted.map(([name, score], i) => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                <span>${i+1}. ${name}</span>
                <strong>${score} pts</strong>
            </div>
        `).join('');

        this.container.innerHTML = `
            <h2>Classement Final 🏆</h2>
            <div style="width:100%; margin:20px 0;">${html}</div>
            <button id="back-menu-btn" class="main-btn">Retour Menu</button>
        `;

        // --- CORRECTION ICI : RETOUR MANUEL SANS RECHARGEMENT ---
        this.container.querySelector('#back-menu-btn').onclick = () => {
            this.container.innerHTML = ''; // On vide le jeu
            
            // On cache l'écran de jeu
            const screenGame = document.getElementById('screen-game');
            screenGame.classList.remove('active');
            screenGame.classList.add('hidden');

            // On affiche l'écran de sélection
            const screenSelection = document.getElementById('screen-selection');
            screenSelection.classList.remove('hidden');
            screenSelection.classList.add('active');
        };
    }
}
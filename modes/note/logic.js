/* modes/note/logic.js */
import { themes } from './data.js';

export default class NoteGame {
    constructor(players, container) {
        this.players = players;
        this.container = container;
        this.note = 0;
        this.holders = []; 
        this.guessers = [];
        this.currentTheme = "";
    }

    start() {
        this.setupRound();
    }

    setupRound() {
        this.note = Math.floor(Math.random() * 10) + 1;
        this.currentTheme = themes[Math.floor(Math.random() * themes.length)];

        // 1. Mélange des joueurs
        let shuffled = [...this.players].sort(() => 0.5 - Math.random());
        
        // 2. Définition du nombre de sachants (MODIFIÉ)
        // On veut un nombre aléatoire strict entre 1 et (Total - 1)
        const maxHolders = this.players.length - 1;
        
        // Math.random() * maxHolders donne un nombre entre 0 et max-1 (ex: 0 à 1.99 pour 2)
        // Math.floor(...) + 1 ramène ça entre 1 et max.
        const nbHolders = Math.floor(Math.random() * maxHolders) + 1;

        this.holders = shuffled.slice(0, nbHolders);
        this.guessers = shuffled.slice(nbHolders);

        this.showIntro();
    }

    showIntro() {
        // On formate la liste pour qu'elle soit jolie (ex: "Hugo et Thomas")
        const holdersNames = this.holders.map(p => `<strong>${p}</strong>`);
        const holdersList = holdersNames.length > 1 
            ? holdersNames.slice(0, -1).join(', ') + ' et ' + holdersNames.slice(-1)
            : holdersNames[0];
        
        this.container.innerHTML = `
            <div style="font-size:3em; margin-bottom:10px;">🎯</div>
            <h2>Le Jeu de la Note</h2>
            
            <div style="background:#fff3e0; padding:15px; border-radius:15px; margin:20px 0; border:2px solid #ffb74d;">
                <p style="color:#f57c00; font-weight:bold; margin-bottom:5px;">LES SACHANTS :</p>
                <p>${holdersList}</p>
            </div>

            <p>Ces personnes vont recevoir la note.</p>
            <p>Les autres, <strong>tournez-vous !</strong></p>

            <button id="show-note-btn" class="main-btn" style="margin-top:20px">Voir la note</button>
        `;

        this.container.querySelector('#show-note-btn').onclick = () => this.showSecretNote();
    }

    showSecretNote() {
        this.container.innerHTML = `
            <h2>Votre Note</h2>
            
            <div class="note-display" style="font-size:5em; font-weight:900; color:var(--accent-color); margin:30px 0; text-shadow: 4px 4px 0px #eee;">
                ${this.note}/10
            </div>

            <p>Mémorisez bien ce chiffre.</p>
            <p>Vous devez répondre aux questions en fonction de cette note.</p>

            <button id="hide-note-btn" class="main-btn" style="margin-top:30px">Cacher et Jouer</button>
        `;

        this.container.querySelector('#hide-note-btn').onclick = () => this.showGamePhase();
    }

    showGamePhase() {
        const guessersNames = this.guessers.map(p => `<strong style="color:var(--accent-color)">${p}</strong>`);
        const guessersList = guessersNames.length > 1 
            ? guessersNames.slice(0, -1).join(', ') + ' et ' + guessersNames.slice(-1)
            : guessersNames[0];

        this.container.innerHTML = `
            <div style="font-size:3em; margin-bottom:10px;">🤔</div>
            <h2>Aux Devins !</h2>
            <p>${guessersList}, c'est à vous.</p>

            <div style="background:#e3f2fd; padding:20px; border-radius:20px; margin:20px 0; border:2px solid #2196f3;">
                <p style="font-size:0.9em; color:#1565c0; margin-bottom:5px;">EXEMPLE DE QUESTION :</p>
                <p style="font-size:1.2em; font-weight:bold; color:#0d47a1;">
                    "Donne-moi un(e) ${this.currentTheme} qui vaut cette note."
                </p>
            </div>

            <p style="font-size:0.9em; color:#666;">
                Posez vos questions aux sachants pour déduire la note sur 10.
            </p>

            <button id="reveal-btn" class="main-btn" style="margin-top:30px">Révéler la note</button>
        `;

        this.container.querySelector('#reveal-btn').onclick = () => this.reveal();
    }

    reveal() {
        if (window.confetti) window.confetti();

        this.container.innerHTML = `
            <h2>La note était...</h2>
            
            <div class="note-display" style="font-size:6em; font-weight:900; color:var(--text-color); margin:20px 0;">
                ${this.note}/10
            </div>

            <div style="display:flex; gap:10px; margin-top:30px; width:100%;">
                <button id="restart-btn" class="main-btn" style="flex:1;">Rejouer</button>
                <button id="quit-btn" class="secondary-btn" style="flex:1; margin-top:0;">Quitter</button>
            </div>
        `;

        this.container.querySelector('#restart-btn').onclick = () => this.start();
        this.container.querySelector('#quit-btn').onclick = () => {
            this.container.innerHTML = '';
            document.getElementById('screen-game').classList.add('hidden');
            document.getElementById('screen-selection').classList.remove('hidden');
            document.getElementById('screen-selection').classList.add('active');
        };
    }
}
/* modes/rituel/cards/jeux/logic.js */
import { data } from './data.js';
import tuPreferesData from './tu_preferes_data.js'; 
import themesData from './themes_data.js'; // Import de la liste des thèmes

export default class JeuxGame {
    constructor(players) { this.players = players; }

    getConfig() {
        return {
            mode: 'minijeu', 
            theme: {
                category: "🎮 MINI-JEU",
                color: "#9c27b0", 
                bg: "#f3e5f5"
            },
            data: data
        };
    }
}

// --- LE DISPATCHER ---
export function handleMiniGame(gameInstance, cardData) {
    const gameId = cardData.rawText; 

    switch (gameId) {
        case 'split':
            launchSplitGame(gameInstance, cardData._config.theme);
            break;
        
        case 'pari': 
            launchPariGame(gameInstance, cardData._config.theme);
            break;

        case 'tu_preferes':
            launchTuPreferesGame(gameInstance, cardData._config.theme);
            break;

        case 'themes':
            launchThemesGame(gameInstance, cardData._config.theme);
            break;

        default:
            console.error("Jeu inconnu : " + gameId);
            gameInstance.nextCard(); 
    }
}

// ==========================================
//  ZONE DES JEUX
// ==========================================

// --- JEU 4 : LES THÈMES (CASCADE) ---
function launchThemesGame(gameInstance, theme) {
    const container = gameInstance.container;
    const themeChoisi = themesData[Math.floor(Math.random() * themesData.length)];
    const p1 = gameInstance.getBalancedPlayers(1)[0];
    const drink = gameInstance.injectDrink("{drink}");

    container.innerHTML = `
        <div class="rituel-card" id="current-card">
            <div class="rituel-category" style="background:${theme.bg}; color:${theme.color};">LE JEU DES THÈMES</div>
            
            <div class="rituel-content" style="font-size:1.2em; margin-bottom:15px;">
                <span style="color:var(--accent-color); font-weight:800;">${p1}</span>, commence ! 
                <br><br>
                Citez chacun votre tour :<br>
                <strong style="text-transform:uppercase; color:${theme.color}; font-size:1.1em;">
                    "${themeChoisi}"
                </strong>
            </div>

            <div class="rituel-subtext" style="background:rgba(0,0,0,0.05); padding:10px; border-radius:10px;">
                Le premier qui sèche ou qui répète prend 
                <strong style="color:#ff1744;">${drink}</strong>.
            </div>

            <button class="vote-btn" style="margin-top:25px; background:${theme.color}; color:white;" onclick="window.nextRituelCard(this)">Terminé</button>
        </div>
    `;
    
    if (navigator.vibrate) navigator.vibrate(50);
}

// --- JEU 3 : TU PRÉFÈRES ---
function launchTuPreferesGame(gameInstance, theme) {
    const container = gameInstance.container;
    const question = tuPreferesData[Math.floor(Math.random() * tuPreferesData.length)];

    const showCard = () => {
        container.innerHTML = `
            <div class="rituel-card" id="current-card">
                <div class="rituel-category" style="background:${theme.bg}; color:${theme.color};">TU PRÉFÈRES...</div>
                
                <div style="display:flex; flex-direction:column; gap:15px; width:100%; margin-top:10px;">
                    
                    <div style="background: #e3f2fd; color: #1565c0; padding: 20px; border-radius: 20px; border: 2px solid #2196f3; font-weight: 700; font-size: 1.1em; position: relative;">
                        <div style="position:absolute; top:-10px; left:15px; background:#2196f3; color:white; padding:2px 10px; border-radius:10px; font-size:0.7em;">OPTION A</div>
                        ${question.a}
                    </div>

                    <div style="font-weight:900; color:#ccc; font-size:0.9em;">— OU —</div>

                    <div style="background: #ffebee; color: #c62828; padding: 20px; border-radius: 20px; border: 2px solid #ef5350; font-weight: 700; font-size: 1.1em; position: relative;">
                        <div style="position:absolute; top:-10px; left:15px; background:#ef5350; color:white; padding:2px 10px; border-radius:10px; font-size:0.7em;">OPTION B</div>
                        ${question.b}
                    </div>

                </div>

                <div class="rituel-subtext" style="margin-top:25px;">
                    Votez tous en même temps à 3 !<br>
                    <strong>La minorité boit 3 gorgées.</strong>
                </div>

                <button class="vote-btn" style="margin-top:20px; background:${theme.color}; color:white;" onclick="window.nextRituelCard(this)">Suivant</button>
            </div>
        `;
    };

    showCard();
}

// --- JEU 1 : LE SPLIT (Dilemme) ---
function launchSplitGame(gameInstance, theme) {
    const container = gameInstance.container;
    const players = gameInstance.players;
    
    const p1Index = Math.floor(Math.random() * players.length);
    let p2Index = Math.floor(Math.random() * players.length);
    while (p2Index === p1Index) p2Index = Math.floor(Math.random() * players.length);
    
    const p1 = players[p1Index];
    const p2 = players[p2Index];
    const choices = { p1: null, p2: null };

    const possibleSips = [4, 6, 8, 10, 12];
    const totalSips = possibleSips[Math.floor(Math.random() * possibleSips.length)];
    const halfSips = totalSips / 2;

    const showIntro = () => {
        container.innerHTML = `
            <div class="rituel-card">
                <div class="rituel-category" style="background:${theme.bg}; color:${theme.color};">${theme.category}</div>
                <div class="rituel-content" style="font-size:1.4em">
                    <span style="color:${theme.color}">${p1}</span> VS <span style="color:${theme.color}">${p2}</span>
                </div>
                <div class="rituel-subtext">
                    <strong>LE DILEMME (${totalSips} GORGÉES)</strong><br><br>
                    🤝 <strong>Partager</strong> : ${halfSips} gorgées chacun.<br>
                    🔪 <strong>Trahir</strong> : L'autre boit tout (${totalSips}).<br>
                    💀 <strong>Double Trahison</strong> : Tout le monde boit ${totalSips} !
                </div>
                <button id="start-split" class="vote-btn" style="margin-top:30px; background:${theme.color}; color:white;">Commencer</button>
            </div>
        `;
        document.getElementById('start-split').onclick = () => showPassPhone(p1, 'p1');
    };

    const showPassPhone = (playerName, key) => {
        container.innerHTML = `
            <div class="rituel-card">
                <div style="font-size:3em; margin-bottom:20px">🤫</div>
                <div class="rituel-content">Passez le téléphone à <br><strong style="color:${theme.color}">${playerName}</strong></div>
                <button id="ready-btn" class="vote-btn" style="margin-top:30px;">C'est moi</button>
            </div>
        `;
        document.getElementById('ready-btn').onclick = () => showChoice(playerName, key);
    };

    const showChoice = (playerName, key) => {
        container.innerHTML = `
            <div class="rituel-card">
                <div class="rituel-category" style="background:${theme.bg}; color:${theme.color};">${playerName}</div>
                <div class="rituel-content" style="font-size:1.2em">Ton choix ?</div>
                <div style="display:grid; gap:15px; width:100%; margin-top:20px;">
                    <button class="vote-btn" id="btn-split">
                        🤝 PARTAGER<br><span style="font-size:0.7em; font-weight:normal">${halfSips} chacun</span>
                    </button>
                    <button class="vote-btn" id="btn-steal" style="color:#d32f2f;">
                        🔪 TRAHIR<br><span style="font-size:0.7em; font-weight:normal">L'autre prend ${totalSips}</span>
                    </button>
                </div>
            </div>
        `;
        const handle = (c) => {
            choices[key] = c;
            if (key === 'p1') showPassPhone(p2, 'p2');
            else showResult();
        };
        document.getElementById('btn-split').onclick = () => handle('split');
        document.getElementById('btn-steal').onclick = () => handle('steal');
    };

    const showResult = () => {
        let resHtml = "";
        let effectClass = ""; 
        const c1 = choices.p1, c2 = choices.p2;

        if (c1 === 'split' && c2 === 'split') {
            resHtml = `Alliance !<br><strong>${halfSips} gorgées</strong> chacun.`;
            if(window.confetti) window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } 
        else if (c1 === 'steal' && c2 === 'steal') {
            resHtml = `Double Trahison !<br><strong>${totalSips} gorgées</strong> chacun !`;
            effectClass = "effect-shake"; 
        } 
        else if (c1 === 'steal') {
            resHtml = `${p1} a trahi !<br>${p2} boit <strong>${totalSips} gorgées</strong>.`;
        } 
        else {
            resHtml = `${p2} a trahi !<br>${p1} boit <strong>${totalSips} gorgées</strong>.`;
        }

        container.innerHTML = `
            <div class="rituel-card ${effectClass}" id="current-card">
                <div class="rituel-category" style="background:${theme.bg}; color:${theme.color};">RÉSULTAT</div>
                <div class="rituel-content" style="font-size:1.3em">${resHtml}</div>
                <button class="vote-btn" style="margin-top:30px; background:${theme.color}; color:white;" onclick="window.nextRituelCard(this)">Suivant</button>
            </div>
        `;
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    };

    showIntro();
}

// --- JEU 2 : LE CASINO (Gros vs Petit) ---
function launchPariGame(gameInstance, theme) {
    const container = gameInstance.container;

    // ÉTAPE 1 : CHOIX DU CAMP
    const showIntro = () => {
        container.innerHTML = `
            <div class="rituel-card">
                <div class="rituel-category" style="background:${theme.bg}; color:${theme.color};">🎰 LE CASINO</div>
                <div class="rituel-content" style="font-size:1.3em">
                    Faites vos jeux !<br>Choisissez votre camp.
                </div>
                
                <div style="display:grid; gap:15px; width:100%; margin:20px 0; text-align:left;">
                    <div style="background:#e8f5e9; padding:15px; border-radius:15px; border:2px solid #4caf50;">
                        <strong>🟢 ÉQUIPE PETIT</strong><br>
                        <small>75% de chance de distribuer 1 pénalité.</small>
                    </div>
                    <div style="background:#ffebee; padding:15px; border-radius:15px; border:2px solid #e53935;">
                        <strong>🔴 ÉQUIPE GROS</strong><br>
                        <small>25% de chance de distribuer 4 pénalités.</small>
                    </div>
                </div>

                <div class="rituel-subtext">Annoncez votre choix à voix haute !</div>
                <button id="reveal-result" class="vote-btn" style="margin-top:20px; background:${theme.color}; color:white;">Voir le tirage</button>
            </div>
        `;
        document.getElementById('reveal-result').onclick = () => showResult();
    };

    // ÉTAPE 2 : RÉSULTAT
    const showResult = () => {
        const isPetitWinner = Math.random() < 0.75;
        const winPetit = isPetitWinner;
        const winGros = !isPetitWinner;

        // EFFETS DE VICTOIRE (Confettis seulement)
        if (window.confetti) {
             window.confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: winPetit ? ['#4caf50', '#81c784'] : ['#e53935', '#ef5350']
            });
        }

        const htmlPetit = winPetit 
            ? `<span style="color:#2e7d32; font-weight:bold;">GAGNÉ ✅</span><br><small>Distribuez 1 gorgée</small>` 
            : `<span style="color:#7f8c8d; font-weight:bold;">PERDU ❌</span><br><small>Rien à boire !</small>`;

        const htmlGros = winGros 
            ? `<span style="color:#2e7d32; font-weight:bold;">GAGNÉ ✅</span><br><small>Distribuez 4 gorgées</small>` 
            : `<span style="color:#7f8c8d; font-weight:bold;">PERDU ❌</span><br><small>Rien à boire !</small>`;

        container.innerHTML = `
            <div class="rituel-card" id="current-card">
                <div class="rituel-category" style="background:${theme.bg}; color:${theme.color};">RÉSULTATS DU TIRAGE</div>
                
                <div style="display:grid; gap:20px; width:100%; margin:30px 0;">
                    <div style="padding:15px; border-radius:15px; background:#f9f9f9; border:1px solid #ddd;">
                        <div style="font-size:1.2em; margin-bottom:5px;">Pour les <strong>PETITS</strong></div>
                        ${htmlPetit}
                    </div>

                    <div style="padding:15px; border-radius:15px; background:#f9f9f9; border:1px solid #ddd;">
                        <div style="font-size:1.2em; margin-bottom:5px;">Pour les <strong>GROS</strong></div>
                        ${htmlGros}
                    </div>
                </div>

                <button class="vote-btn" style="margin-top:10px; background:${theme.color}; color:white;" onclick="window.nextRituelCard(this)">Suivant</button>
            </div>
        `;
        
        if (navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 200]);
    };

    showIntro();
}
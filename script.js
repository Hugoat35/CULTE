/* --- script.js --- */

// 1. NETTOYAGE RADICAL AU DÉMARRAGE
// On supprime toute mémoire précédente pour éviter les fantômes
localStorage.removeItem('culte_players');

const state = {
    players: [], // On part de zéro, toujours.
    currentGame: null
};

// Elements DOM
const screens = {
    players: document.getElementById('screen-players'),
    selection: document.getElementById('screen-selection'),
    game: document.getElementById('screen-game')
};

const playersContainer = document.getElementById('players-container');
const playerCountLabel = document.getElementById('player-count-label');
const inputName = document.getElementById('new-player-name');
const btnAdd = document.getElementById('add-player-btn');
const btnToGames = document.getElementById('to-games-btn');
const gameContainer = document.getElementById('game-container');

// --- FONCTIONS JOUEURS ---

// On expose la fonction suppression proprement
window.removePlayer = function(index) {
    state.players.splice(index, 1);
    updatePlayerList();
};

function addPlayer() {
    const name = inputName.value.trim();
    if (name && !state.players.includes(name)) {
        state.players.push(name);
        inputName.value = '';
        updatePlayerList();
        inputName.focus();
    }
}

function updatePlayerList() {
    playersContainer.innerHTML = '';
    
    if (state.players.length === 0) {
        playersContainer.innerHTML = '<div class="empty-state" style="width:100%; text-align:center; color:white; opacity:0.7; font-style:italic;">Ajoute tes amis !</div>';
    }

    state.players.forEach((player, index) => {
        const chip = document.createElement('div');
        chip.className = 'player-chip';
        chip.style.transform = `rotate(${(Math.random() - 0.5) * 4}deg)`;
        chip.innerHTML = `
            ${player}
            <div class="remove" onclick="window.removePlayer(${index})">×</div>
        `;
        playersContainer.appendChild(chip);
    });

    const count = state.players.length;
    playerCountLabel.innerText = `${count} Joueur${count > 1 ? 's' : ''}`;
    
    if (count >= 2) {
        btnToGames.disabled = false;
        btnToGames.innerText = "Choisir un jeu";
    } else {
        btnToGames.disabled = true;
        btnToGames.innerText = `Minimum 2 joueurs`;
    }
}

// --- NAVIGATION & UI ---

function showScreen(screenId) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if(target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }

    if(screenId === 'screen-selection') {
        refreshUndercoverCard();
    }
}

function refreshUndercoverCard() {
    const ucCard = document.querySelector('.game-card[data-game="undercover"]');
    if (!ucCard) return;

    const ucTitle = ucCard.querySelector('p');
    if (state.players.length < 3) {
        ucCard.classList.add('disabled');
        if (ucTitle) ucTitle.innerText = "3 joueurs minimum";
    } else {
        ucCard.classList.remove('disabled');
        if (ucTitle) ucTitle.innerText = "Démasquez l'intrus.";
    }
}

// --- EVENTS ---

btnAdd.addEventListener('click', addPlayer);
inputName.addEventListener('keypress', (e) => { if(e.key === 'Enter') addPlayer(); });

btnToGames.addEventListener('click', () => showScreen('screen-selection'));

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.target;
        showScreen(targetId);
    });
});

document.getElementById('quit-game-btn').addEventListener('click', () => {
    window.showCustomModal(
        "Quitter la partie ?",
        "La progression sera perdue.",
        () => {
            gameContainer.innerHTML = '';
            state.currentGame = null;
            showScreen('screen-selection');
        }
    );
});

// --- LANCEMENT JEUX ---

document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', async () => {
        const gameName = card.dataset.game;

        // VÉRIFICATION STRICTE
        if (gameName === 'undercover') {
            if (state.players.length < 3) {
                window.showCustomModal(
                    "Pas assez de joueurs",
                    "Il faut être au moins 3 pour jouer à Undercover !",
                    null 
                );
                return;
            }
        }

        if (card.classList.contains('disabled') && gameName !== 'undercover') return;

        try {
            const module = await import(`./modes/${gameName}/logic.js`);
            showScreen('screen-game');
            gameContainer.innerHTML = '';
            // On envoie une copie propre de la liste
            state.currentGame = new module.default([...state.players], gameContainer);
            state.currentGame.start();
        } catch (err) {
            console.error(err);
            alert("Erreur chargement du jeu"); 
        }
    });
});

// --- MODALE ---
const modal = {
    overlay: document.getElementById('custom-modal'),
    title: document.getElementById('modal-title'),
    msg: document.getElementById('modal-msg'),
    btnConfirm: document.getElementById('modal-confirm'),
    btnCancel: document.getElementById('modal-cancel')
};

window.showCustomModal = (title, message, onConfirm) => {
    modal.title.innerText = title;
    modal.msg.innerText = message;
    modal.overlay.classList.remove('hidden');
    requestAnimationFrame(() => modal.overlay.classList.add('active'));

    const newBtnConfirm = modal.btnConfirm.cloneNode(true);
    modal.btnConfirm.replaceWith(newBtnConfirm);
    modal.btnConfirm = newBtnConfirm;

    const newBtnCancel = modal.btnCancel.cloneNode(true);
    modal.btnCancel.replaceWith(newBtnCancel);
    modal.btnCancel = newBtnCancel;

    if (onConfirm) {
        modal.btnCancel.style.display = 'block';
        modal.btnConfirm.innerText = "Confirmer";
        modal.btnConfirm.addEventListener('click', () => {
            closeModal();
            onConfirm();
        });
    } else {
        modal.btnCancel.style.display = 'none';
        modal.btnConfirm.innerText = "C'est compris";
        modal.btnConfirm.addEventListener('click', closeModal);
    }
    modal.btnCancel.addEventListener('click', closeModal);
};

function closeModal() {
    modal.overlay.classList.remove('active');
    setTimeout(() => modal.overlay.classList.add('hidden'), 300);
}

// Init
updatePlayerList();
// --- script.js ---

const state = {
    players: JSON.parse(localStorage.getItem('culte_players')) || [],
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

// --- UTILITAIRES MODALE (Nouveau) ---
const modal = {
    overlay: document.getElementById('custom-modal'),
    title: document.getElementById('modal-title'),
    msg: document.getElementById('modal-msg'),
    btnConfirm: document.getElementById('modal-confirm'),
    btnCancel: document.getElementById('modal-cancel')
};

// Fonction pour afficher une belle popup
window.showCustomModal = (title, message, onConfirm) => {
    modal.title.innerText = title;
    modal.msg.innerText = message;
    
    // Afficher la modale
    modal.overlay.classList.remove('hidden');
    requestAnimationFrame(() => modal.overlay.classList.add('active'));

    // Gestion du bouton Confirmer (Nettoyage des anciens événements via cloneNode)
    const newBtnConfirm = modal.btnConfirm.cloneNode(true);
    modal.btnConfirm.replaceWith(newBtnConfirm);
    modal.btnConfirm = newBtnConfirm;

    // Gestion du bouton Annuler
    const newBtnCancel = modal.btnCancel.cloneNode(true);
    modal.btnCancel.replaceWith(newBtnCancel);
    modal.btnCancel = newBtnCancel;

    // Assigner les actions
    modal.btnConfirm.addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
    modal.btnCancel.addEventListener('click', closeModal);
};

function closeModal() {
    modal.overlay.classList.remove('active');
    setTimeout(() => modal.overlay.classList.add('hidden'), 300);
}

// --- FONCTIONS JOUEURS ---

function savePlayers() {
    localStorage.setItem('culte_players', JSON.stringify(state.players));
}

function updatePlayerList() {
    playersContainer.innerHTML = '';
    
    if(state.players.length === 0) {
        playersContainer.innerHTML = '<div class="empty-state" style="width:100%; text-align:center; color:white; opacity:0.7; font-style:italic;">Ajoute tes amis !</div>';
    }

    state.players.forEach((player, index) => {
        const chip = document.createElement('div');
        chip.className = 'player-chip';
        // Rotation aléatoire légère
        chip.style.transform = `rotate(${(Math.random() - 0.5) * 4}deg)`;
        chip.innerHTML = `
            ${player}
            <div class="remove" onclick="removePlayer(${index})">×</div>
        `;
        playersContainer.appendChild(chip);
    });

    playerCountLabel.innerText = `${state.players.length} Joueur${state.players.length > 1 ? 's' : ''}`;
    
    // On autorise l'accès aux jeux dès qu'il y a 2 joueurs
    if (state.players.length >= 2) {
        btnToGames.disabled = false;
        btnToGames.innerText = "Choisir un jeu";
    } else {
        btnToGames.disabled = true;
        btnToGames.innerText = `Minimum 2 joueurs`;
    }
}

window.removePlayer = (index) => {
    state.players.splice(index, 1);
    savePlayers();
    updatePlayerList();
};

function addPlayer() {
    const name = inputName.value.trim();
    if (name && !state.players.includes(name)) {
        state.players.push(name);
        savePlayers();
        inputName.value = '';
        updatePlayerList();
        inputName.focus();
    }
}

btnAdd.addEventListener('click', addPlayer);
inputName.addEventListener('keypress', (e) => { if(e.key === 'Enter') addPlayer(); });

// --- NAVIGATION ---

function showScreen(screenId) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    target.classList.remove('hidden');
    target.classList.add('active');

    // Gestion visuelle des cartes de jeu
    if(screenId === 'screen-selection') {
        const ucCard = document.querySelector('.game-card[data-game="undercover"]');
        const ucTitle = ucCard.querySelector('p');
        
        if(state.players.length < 3) {
            ucCard.classList.add('disabled');
            ucTitle.innerText = "3 joueurs minimum";
        } else {
            ucCard.classList.remove('disabled');
            ucTitle.innerText = "Démasquez l'intrus.";
        }
    }
}

btnToGames.addEventListener('click', () => showScreen('screen-selection'));

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.target;
        showScreen(targetId);
    });
});

// MODIF: Utilisation de la nouvelle Modale pour quitter
document.getElementById('quit-game-btn').addEventListener('click', () => {
    window.showCustomModal(
        "Quitter la partie ?",
        "La progression en cours sera perdue.",
        () => {
            gameContainer.innerHTML = '';
            state.currentGame = null;
            showScreen('screen-selection');
        }
    );
});

// --- LANCEMENT DES JEUX ---

document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', async () => {
        const gameName = card.dataset.game;

        // MODIF: Alerte personnalisée si pas assez de joueurs
        if (gameName === 'undercover' && state.players.length < 3) {
            window.showCustomModal(
                "Pas assez de joueurs",
                "Il faut être au moins 3 pour jouer à Undercover !",
                null // Pas d'action spécifique
            );
            return;
        }

        if (card.classList.contains('disabled') && gameName !== 'undercover') return;

        try {
            const module = await import(`./modes/${gameName}/logic.js`);
            showScreen('screen-game');
            gameContainer.innerHTML = '';
            state.currentGame = new module.default(state.players, gameContainer);
            state.currentGame.start();
        } catch (err) {
            console.error(err);
            alert("Erreur chargement du jeu"); // Fallback simple cas d'erreur technique
        }
    });
});

updatePlayerList();
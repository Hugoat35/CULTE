/* sound.js - Générateur de sons synthétiques */

class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isMuted = false;
    }

    // Un petit "Pop" satisfaisant pour les cartes
    playPop() {
        if (this.isMuted) return;
        this.resume();
        
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1); // Chute rapide de fréquence

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.1);
    }

    // Une alarme grave pour les Virus
    playVirus() {
        if (this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth'; // Son plus agressif
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.3);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.5);
    }

    // Une petite mélodie de victoire (Jackpot)
    playJackpot() {
        if (this.isMuted) return;
        this.resume();

        const now = this.ctx.currentTime;
        // Accord majeur rapide (Do - Mi - Sol - Do haut)
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + (i * 0.08); // Décalage pour l'effet arpège

            osc.type = 'triangle'; // Son style jeu vidéo
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.3);
        });
    }

    // Réveille l'audio (nécessaire sur les navigateurs modernes)
    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}

// On exporte une instance unique pour l'utiliser partout
export const sounds = new SoundManager();
import { data } from './data.js';

export default class HardcoreGame {
    constructor(players) {}

    getConfig() {
        return {
            mode: 'simple', 
            theme: {
                category: "🔥 HARDCORE 🔥", // Le titre qui claque
                color: "#ff1744", // Rouge vif
                bg: "#212121"     // Gris très foncé (presque noir)
            },
            subtext: "Âmes sensibles s'abstenir...",
            data: data
        };
    }
}
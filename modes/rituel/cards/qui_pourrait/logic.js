import { data } from './data.js';

export default class QuiPourraitGame {
    constructor(players) {}

    getConfig() {
        return {
            mode: 'flip', // Active le mode carte retournée + vote
            theme: {
                category: "Qui pourrait...",
                color: "#2196f3",
                bg: "#e3f2fd"
            },
            subtext: "Touchez pour retourner ↻",
            data: data
        };
    }
}
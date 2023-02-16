'use strict'
class Session {
    constructor(id, name) {
        this.players = new Map;
        this.teams = [ [],[] ];
        this.leaders = [];
        this.counter = [];
        this.lobby = [];
        //сделать это через Set
        this.ready = []
        if (id && name) {
            this.addPlayer(id, name);
        }
    }

    static code() {
        const possibleChars = [
            "🍎", "🍊", "🍓", "🍉", "🍇", "🍒", "🍑", "🥑", "🥦", "🌽", "🌶️", "🥕", "🥔"
        ];
        let sessionCode = "";
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * possibleChars.length);
            sessionCode += possibleChars[randomIndex];
        }
        return sessionCode
    }
    addPlayer(id, name) {
        this.players.set(id, name)
    }
    name(id) {
        return this.players.get(id)
    }
    fairPlay() {
        let isFair = false
        if (
            (this.teams[0].length >= 2) &&
            (this.teams[1].length >= 2) &&
            (((this.teams[0].length % this.teams[1].length) <= 1) || ((this.teams[1].length % this.teams[0].length) <= 1))) {
            isFair = true
        }
        return isFair
    }
    agree(type) {
        if (type === 'check') {
            let isAgreed = false
            if (this.ready.length === this.players.size) {
                isAgreed = true
            }
            return isAgreed
        }
        if (type === 'all') {
            for (let player of this.players.keys()) {
                this.lobby.push(player)
            }
        }
        if (Array.isArray(type)) {
            for (let i = 0; i = type.length - 1; i++) {
                this.lobby.push(type[i])
            }
        }
    }
    switchLeaders() {
        if (this.counter === 0) {
            function shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }
            shuffle(this.teams[0]);
            shuffle(this.teams[1]);
        }
        for (let i = 0; i < 2; i++) {
            const k = this.counter % teams[i].length;
            this.leaders[i] = teams[i][k]
        }
    }
}

// const arg = new Session('1235', 'oleg')
// arg.toTeam('1235', 1)

// arg.agreed('check')

// console.log(arg.agree('check'))

module.exports = Session;
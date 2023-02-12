class Session {
    constructor(id, name) {
        this.players = new Map;
        this.team1 = [];
        this.team2 = [];
        this.counter = [];
        this.lobby = [];
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
    toTeam(id, team) {
        const teams = [this.team1, this.team2];
        teams[team - 1].push(id);
    }
    fairPlay() {
        let isFair = false
        if (
            (this.team1.length >= 2) &&
            (this.team2.length >= 2) &&
            (((this.team1.length % this.team2.length) <= 1) || ((this.team2.length % this.team1.length) <= 1))) {
            fair = true
        }
        return isFair
    }
    name(id) {
        return this.players.get(id)
    }
    leader(team) {
        if (this.counter === 0) {
            this.shuffleTeams()
        }
        const i = this.counter % team.length;
        return leader = team[i]
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
    shuffleTeams() {
        function shuffle(array) {
            for (let i = array.team1.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        shuffle([1, 2])
    }
}

const arg = new Session('1235', 'oleg')
// arg.toTeam('1235', 1)

// arg.agreed('check')

console.log(arg.agree('check'))

module.exports = Session;
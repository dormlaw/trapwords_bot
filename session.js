class Session {
    constructor(id, name) {
        this.players = new Map;
        this.team1 = [];
        this.team2 = [];
        this.leaders = [];
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
}

// const arg = new Session('1235', 'oleg')
// arg.toTeam('1235', 1)



// console.log(Session.name())

module.exports = Session;
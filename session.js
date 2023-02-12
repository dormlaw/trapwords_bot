class Session {
    constructor(id, name) {
        this.players = new Map;
        this.team1 = [];
        this.team2 = [];
        this.leaders = [];
        if (id && name) {
            this.players.set(id, name)
        }
    }

    static name() {
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

    toTeam(id, team) {
        const teams = [this.team1, this.team2];
        teams[team - 1].push(id);
    }
    fairPlay() {
        let fair = false
        if (
            (this.team1.size >= 2) &&
            (this.team2.size >= 2) &&
            (((this.team1.size % this.team2.size) <= 1) || ((this.team2.size % this.team1.size) <= 1))) {
                fair = true
        }
        return fair
    }
}

const arg = new Session('1235', 'oleg')
arg.toTeam('1235', 1)


console.log(arg.fairPlay())

module.exports = Session;
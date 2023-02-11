// class Session extends Map() {

// }

session = {
    create: function () {
        const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let sessionCode = "";
        for (let i = 0; i < 6; i++) {
            sessionCode += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
        }
    }
}
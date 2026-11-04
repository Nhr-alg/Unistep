/**
 * UniStep Command & State Handler
 *
 * This module handles basic UI commands and keeps track of the
 * session state to allow for "retry" and "clear" functionality.
 */

class SessionManager {
    constructor() {
        this.lastInput = null;
        this.lastResponse = null;
    }

    setLastProblem(input, response) {
        this.lastInput = input;
        this.lastResponse = response;
    }

    clear() {
        this.lastInput = null;
        this.lastResponse = null;
    }

    getLastProblem() {
        return this.lastInput;
    }

    getLastResponse() {
        return this.lastResponse;
    }
}

window.Session = new SessionManager();

class CommandHandler {
    static handle(text) {
        const cleanText = text.toLowerCase().trim();

        if (["try again", "retry", "again", "recalculate"].includes(cleanText)) {
            return { action: "RETRY" };
        }

        if (["clear", "reset", "new problem"].includes(cleanText)) {
            return { action: "CLEAR" };
        }

        if (["help", "how to use"].includes(cleanText)) {
            return { action: "HELP" };
        }

        return null; // Not a command
    }
}

window.CommandHandler = CommandHandler;

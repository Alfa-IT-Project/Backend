
export class UserAuthError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserAuthError';
    }
}
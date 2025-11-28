// User Model (placeholder for database integration)

class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Static method to find user by email
    static findByEmail(email, users) {
        return users.find(user => user.email === email);
    }

    // Static method to find user by ID
    static findById(id, users) {
        return users.find(user => user.id === id);
    }

    // Convert to safe object (without password)
    toSafeObject() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export default User;
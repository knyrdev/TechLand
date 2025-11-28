import "dotenv/config"
export const {
    PORT = 3000,
    SESSION_SECRET = "techland-secret-key"
} = process.env
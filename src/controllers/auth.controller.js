// Auth Controller
import bcrypt from "bcryptjs";

// Temporary in-memory user storage (replace with database later)
const users = [];

export const getLoginPage = (req, res) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    res.render("pages/auth/login", {
        title: "Login - TechLand",
        error: null
    });
};

export const getRegisterPage = (req, res) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    res.render("pages/auth/register", {
        title: "Register - TechLand",
        error: null
    });
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.render("pages/auth/login", {
                title: "Login - TechLand",
                error: "Invalid email or password"
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("pages/auth/login", {
                title: "Login - TechLand",
                error: "Invalid email or password"
            });
        }

        // Create session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        res.redirect("/");
    } catch (error) {
        console.error("Login error:", error);
        res.render("pages/auth/login", {
            title: "Login - TechLand",
            error: "An error occurred during login"
        });
    }
};

export const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validate input
        if (!name || !email || !password || !confirmPassword) {
            return res.render("pages/auth/register", {
                title: "Register - TechLand",
                error: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.render("pages/auth/register", {
                title: "Register - TechLand",
                error: "Passwords do not match"
            });
        }

        // Check if user exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.render("pages/auth/register", {
                title: "Register - TechLand",
                error: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        };
        users.push(newUser);

        // Create session
        req.session.user = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        };

        res.redirect("/");
    } catch (error) {
        console.error("Registration error:", error);
        res.render("pages/auth/register", {
            title: "Register - TechLand",
            error: "An error occurred during registration"
        });
    }
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
        }
        res.redirect("/");
    });
};
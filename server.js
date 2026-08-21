const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const session = require("express-session");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { csrfSync } = require("csrf-sync");

require("dotenv").config();

const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");
const User = require("./models/User");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const app = express();

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." }
});

const PORT = process.env.PORT;

const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY,"utf8");

function encrypt(text) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv );

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
}

function decrypt(data) {
    const [ivHex, encryptedText] = data.split(":");

    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc",encryptionKey,iv );

    let decrypted = decipher.update(encryptedText,"hex","utf8" );

    decrypted += decipher.final("utf8");

    return decrypted;
}



//    Session Management


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
} })
);




app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//    CSRF Protection


const {
    csrfSynchronisedProtection,
    generateToken
} = csrfSync();

app.get("/csrf-token", (req, res) => {
    const token = generateToken(req);

    res.json({
        token
    });
});

app.use(csrfSynchronisedProtection);



//    Authentication Middleware


function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }

    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }

    if (req.session.user.role !== "admin") {
        return res.status(404).sendFile("404.html", {
            root: "public"
        });
    }

    next();
}


//    Protected Pages

app.get("/home.html",apiLimiter, requireLogin, (req, res) => {
        res.sendFile("home.html", {
            root: "public"
        });
    }
);

app.get( "/admin.html", apiLimiter, requireAdmin,(req, res) => {
        res.sendFile("admin.html", {
            root: "public"
        });
    }
);


//    Admin API

app.get( "/api/admin/users", apiLimiter, requireAdmin, async (req, res) => {
        try {
            const users = await User.find({},
                {
                    username: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    role: 1
                }
            );

            res.json(users);

        } catch (error) {
            console.error( "Admin users error:", error.message );

            res.status(500).json({
                message: "Failed to load users"
            });
        }
    }
);


//    Signup

app.post("/signup", async (req, res) => {
    try {
        const {
            username,
            firstName,
            lastName,
            email,
            phone,
            address,
            password
        } = req.body;

        const cleanUsername =
            DOMPurify.sanitize(username);

        const cleanFirstName =
            DOMPurify.sanitize(firstName);

        const cleanLastName =
            DOMPurify.sanitize(lastName);

        const cleanEmail =
            DOMPurify.sanitize(email);

        const cleanPhone =
            DOMPurify.sanitize(phone);

        const cleanAddress =
            DOMPurify.sanitize(address);

        if (
            !cleanUsername ||
            !cleanFirstName ||
            !cleanLastName ||
            !cleanEmail ||
            !cleanPhone ||
            !cleanAddress ||
            !password
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!validator.isEmail(cleanEmail)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        const usernameRegex =  /^[a-zA-Z0-9_]{3,20}$/;

        if (!usernameRegex.test(cleanUsername)) {
            return res.status(400).json({
                message:
                    "Username must be 3-20 characters and contain only letters, numbers, and underscore"
            });
        }

        const phoneRegex = /^07[789]\d{7}$/;

        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({
                message: "Invalid phone number"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { username: cleanUsername },
                { email: cleanEmail }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "Username or email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        const encryptedPhone =
            encrypt(cleanPhone);

        const encryptedAddress =
            encrypt(cleanAddress);

        const user = await User.create({
            username: cleanUsername,
            firstName: cleanFirstName,
            lastName: cleanLastName,
            email: cleanEmail,
            phone: encryptedPhone,
            address: encryptedAddress,
            password: hashedPassword,
            role: "user"
        });

        res.status(201).json({ message:"User registered successfully", userId: user._id
        });

    } catch (error) {console.error( "Signup error:", error.message );

        res.status(500).json({ message: "Registration failed" });
    }
});


//    Login

app.post("/login", async (req, res) => {
    try {
        const {  username,password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message:
                    "Username and password are required"
            });
        }

        const cleanUsername =
            DOMPurify.sanitize(username);

        const user = await User.findOne({
            username: cleanUsername
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password" });
        }

        const passwordMatch =
            await bcrypt.compare( password, user.password );

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        if (user.role === "admin") { return res.redirect("/admin.html");
        }

        return res.redirect("/home.html");

    } catch (error) {
        console.error(
            "Login error:",
            error.message
        );

        res.status(500).json({ message: "Login failed"});
    }
});


//    Logout

app.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        res.json({message:"Logged out successfully" });
    });
});



//    Current User API

app.get("/api/user",requireLogin,async (req, res) => {
        try {
            const user = await User.findById(
                req.session.user.id
            );

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const decryptedPhone =
                decrypt(user.phone);

            const decryptedAddress =
                decrypt(user.address);

            res.json({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: decryptedPhone,
                address: decryptedAddress
            });

        } catch (error) {
            console.error("User data error:", error.message   );

            res.status(500).json({  message: "Failed to get user data" });
        }
    }
);




app.use(express.static("public"));




app.get("/", (req, res) => {
    res.send( "Secure Login System is running!");
});


//    MongoDB Connection

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {console.log("Connected to MongoDB" );

        app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}` );
        });
    })
    .catch((error) => { console.error( "MongoDB connection error:", error.message  );
    });
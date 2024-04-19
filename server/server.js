import bcrypt from 'bcrypt'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import mysql from 'mysql'
import path from 'path'

const app = express();

// Middleware
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "PUT"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employeems"
});

con.connect(function(err) {
    if(err) {
        console.error("Error connecting to database:", err);
        process.exit(1); // Terminate the application on connection error
    } else {
        console.log("Connected to database");
    }
});

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Route to get all students
app.get('/getStudent', (req, res) => {
    const sql = "SELECT * FROM student";
    con.query(sql, (err, result) => {
        if(err) return res.status(500).json({ error: "Error fetching students from database" });
        return res.json({ Status: "Success", Result: result });
    });
});

// Route to get a single student by ID
app.get('/student/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM student where id = ?";
    con.query(sql, [id], (err, result) => {
        if(err) return res.status(500).json({ error: "Error fetching student from database" });
        return res.json({ Status: "Success", Result: result });
    });
});

// Route to delete a student by ID
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM student WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if(err) return res.status(500).json({ error: "Error deleting student from database" });
        return res.json({ Status: "Success" });
    });
});

// Middleware to verify user authentication using JWT token
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.status(401).json({ error: "You are not authenticated" });
    } else {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if(err) return res.status(401).json({ error: "Invalid token" });
            req.role = decoded.role;
            req.id = decoded.id;
            next();
        });
    }
};

// Route to fetch dashboard data for authenticated users
app.get('/dashboard', verifyUser, (req, res) => {
    return res.json({ Status: "Success", role: req.role, id: req.id });
});

// Route to get the count of students
app.get('/studentCount', (req, res) => {
    const sql = "SELECT COUNT(id) AS studentCount FROM student";
    con.query(sql, (err, result) => {
        if(err) return res.status(500).json({ error: "Error counting students in database" });
        return res.json({ Status: "Success", Result: result });
    });
});

// Route to handle user login
app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ? AND  password = ?";
    con.query(sql, [req.body.email, req.body.password], (err, result) => {
        if(err) return res.status(500).json({ error: "Error executing database query" });
        if(result.length > 0) {
            const id = result[0].id;
            const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
            res.cookie('token', token);
            return res.json({ Status: "Success" });
        } else {
            return res.status(401).json({ error: "Wrong email or password" });
        }
    });
});

// Route to handle student login
app.post('/student_login', (req, res) => {
    const sql = "SELECT * FROM student WHERE email = ?";
    con.query(sql, [req.body.email], (err, result) => {
        if(err) return res.status(500).json({ error: "Error executing database query" });
        if(result.length > 0) {
            bcrypt.compare(req.body.password.toString(), result[0].password, (err, response) => {
                if(err) return res.status(500).json({ error: "Error comparing passwords" });
                if(response) {
                    const token = jwt.sign({ role: "student", id: result[0].id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
                    res.cookie('token', token);
                    return res.json({ Status: "Success", id: result[0].id });
                } else {
                    return res.status(401).json({ error: "Wrong email or password" });
                }
            });
        } else {
            return res.status(401).json({ error: "Wrong email or password" });
        }
    });
});

// Route to handle user logout
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: "Success" });
});

// Route to create a new student
app.post('/create', upload.single('image'), (req, res) => {
    const sql = "INSERT INTO student (`name`, `email`, `password`) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if(err) return res.status(500).json({ error: "Error hashing password" });
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.department_id
        ];
        con.query(sql, [values], (err, result) => {
            if(err) return res.status(500).json({ error: "Error executing database query" });
            return res.json({ Status: "Success" });
        });
    });
});

const port = 8081;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

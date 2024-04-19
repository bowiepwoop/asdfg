import bcrypt from 'bcrypt';
import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import con from "../utils/db.js";

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie('token', token)
      return res.json({ loginStatus: true });
    } else {
        return res.json({ loginStatus: false, Error:"wrong email or password" });
    }
  });
});

router.get('/department', (req, res) => {
    const sql = "SELECT * FROM department";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.post('/add_department', (req, res) => {
    const sql = "INSERT INTO department (`name`) VALUES (?)"
    con.query(sql, [req.body.department], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true})
    })
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})

router.post('/add_teacher',upload.single('image'), (req, res) => {
    const sql = `INSERT INTO teacher
    (name,email,password, department_id)
    VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.department_id
        ]
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Status: false, Error: err})
            return res.json({Status: true})
        })
    })
})

router.get('/teacher', (req, res) => {
    const sql = "SELECT * FROM teacher";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.get('/teacher/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM teacher WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_teacher/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE teacher
        set name = ?, email = ?, department_id = ?
        Where id = ?`
    const values = [
        req.body.name,
        req.body.email,
        req.body.department_id
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/auth/admin', (req, res) => {
    const sql = "SELECT * FROM admin";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching admin:", err);
            return res.status(500).json({ error: "Error fetching admin" });
        }
        return res.json(result);
    });
});
  router.get('/auth/admin/:id', (req, res) => {
    const id = req.params.id;
  
    const sql = "SELECT * FROM admin WHERE admin_id = ?";
    con.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error fetching admin:", err);
        return res.status(500).json({ error: "Error fetching admin" });
      }
      res.json(result);
    });
  });


router.get('/teacher_count', (req, res) => {
    const sql = "select count(id) as teacher from teacher";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.post('/add_student',upload.single('image'), (req, res) => {
    const sql = `INSERT INTO student
    (name,email,password, department_id)
    VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.department_id
        ]
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Status: false, Error: err})
            return res.json({Status: true})
        })
    })
})

router.get('/student', (req, res) => {
    const sql = "SELECT * FROM student";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.get('/student/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM student WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_student/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE student
        set name = ?, email = ?, department_id = ?
        Where id = ?`
    const values = [
        req.body.name,
        req.body.email,
        req.body.department_id
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.put('/auth/edit_admin/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE admin
        set email = ?, Where id = ?`;
    const values = [
        req.body.email,
    ];
    con.query(sql, [...values, id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" + err });
        return res.json({ Status: true, Result: result });
    });
});

router.put('/edit_department/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE department
        set name = ?, email = ?, department_id = ?
        Where id = ?`
    const values = [
        req.body.name
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})


router.delete('/delete_department/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from department where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.delete('/delete_student/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from student where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})


router.get('/student_count', (req, res) => {
    const sql = "select count(id) as student from student";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

router.post('/add_teacher',upload.single('image'), (req, res) => {
    const sql = `INSERT INTO teacher
    (name,email,password, department_id)
    VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.department_id
        ]
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Status: false, Error: err})
            return res.json({Status: true})
        })
    })
})

router.delete('/delete_teacher/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from teacher where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.delete('/delete_admin/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from admin where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_records', (req, res) => {
    const sql = "select * from admin"
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

export { router as adminRouter };



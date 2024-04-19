import express from 'express';
import jwt from "jsonwebtoken";
import con from "../utils/db.js";

const router = express.Router()

router.get('/student', (req, res) => {
  const department_id = parseInt(req.query.department_id);
  if (!department_id) {
    return res.status(400).json({ error: 'Department ID is required' });
  }

  const filteredStudents = student.filter(student => student.department_id === department_id);
  res.json(filteredStudents);
});

router.get('/student/department/:department_id', (req, res) => {
  const department_id = req.params.department_id;

  const sql = "SELECT * FROM student WHERE department_id = ?";
  con.query(sql, [department_id], (err, result) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ error: "Error fetching students" });
    }
    res.json(result);
  });
});

import bcrypt from 'bcrypt';

router.post("/teacher_login", (req, res) => {
  const sql = "SELECT id, email, password FROM teacher WHERE email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, isMatch) => {
        if (err) return res.json({ loginStatus: false, Error: "Password comparison error" });
        if (isMatch) {
          const email = result[0].email;
          const id = result[0].id;
          const token = jwt.sign(
            { role: "teacher", email: email, id: id },
            "jwt_secret_key",
            { expiresIn: "1d" }
          );
          res.cookie('token', token)
          return res.json({ loginStatus: true, id: id });
        } else {
          return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
      });
    } else {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }
  });
});


  router.get('/detail/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM teacher where id = ?"
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Status: false});
        return res.json(result)
    })
  })

  router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
  })

  router.get('/students/by_department/:departmentId', (req, res) => {
    const department_id = parseInt(req.params.departmentId)
    const studentsInDepartment = students.filter(student => student.department_id === department_id)
    res.json(studentsInDepartment)
  })
  
  export { router as TeacherRouter };



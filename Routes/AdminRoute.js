import express from 'express'
import con from '../utils/db.js'
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";


const router = express.Router()

//admin

router.post("/adminlogin", (req, res) => {
    const sql = "SELECT * from admin Where email = ? and password = ?";
    con.query(sql, [req.body.email, req.body.password], (err, result) => {
      if (err) return res.json({ loginStatus: false, Error: "Query error" });
      if (result.length > 0) {
        const email = result[0].email;
        const token = jwt.sign(
          { role: "admin", email: email},
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

  //category 

router.get('/category', (req, res) => {
    const sql = "SELECT * FROM category";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.post('/add_category', (req, res) => {
    const sql = "INSERT INTO category (`name`) VALUES (?)"
    con.query(sql, [req.body.category], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true})
    })
})

// Delete a category
router.delete('/category/:id', (req, res) => {
  const sql = "DELETE FROM category WHERE id = ?";
  con.query(sql, [req.params.id], (err, result) => {
      if (err) return res.json({ Status: false, Error: "Query Error" });
      return res.json({ Status: true });
  });
});


// Update a category
router.put('/category/:id', (req, res) => {
  const sql = "UPDATE category SET name = ? WHERE id = ?";
  con.query(sql, [req.body.name, req.params.id], (err, result) => {
      if (err) return res.json({ Status: false, Error: "Query Error" });
      return res.json({ Status: true });
  });
});


//uniform

router.get('/uniform', (req, res) => {
  const sql = "SELECT * FROM uniform";
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Query Error:", err); // Log the error for debugging
      return res.json({ Status: false, Error: `Query Error: ${err.message}` });
    }
    return res.json({ Status: true, Result: result });
  });
});

router.post('/add_uniform', (req, res) => {
  const sql = "INSERT INTO uniform (`name`) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) {
      console.error("Query Error:", err); // Log the error for debugging
      return res.json({ Status: false, Error: `Query Error: ${err.message}` });
    }
    return res.json({ Status: true });
  });
});

router.delete('/uniform/:id', (req, res) => {
  const sql = "DELETE FROM uniform WHERE id = ?";
  con.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("Query Error:", err); // Log the error for debugging
      return res.json({ Status: false, Error: `Query Error: ${err.message}` });
    }
    return res.json({ Status: true });
  });
});

router.put('/uniform/:id', (req, res) => {
  const sql = "UPDATE uniform SET name = ? WHERE id = ?";
  con.query(sql, [req.body.name, req.params.id], (err, result) => {
    if (err) {
      console.error("Query Error:", err); // Log the error for debugging
      return res.json({ Status: false, Error: `Query Error: ${err.message}` });
    }
    return res.json({ Status: true });
  });
});


//school

router.get('/school', (req, res) => {
  const sql = "SELECT * FROM school";
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Query Error:", err); // Log the error for debugging
      return res.json({ Status: false, Error: `Query Error: ${err.message}` });
    }
    return res.json({ Status: true, Result: result });
  });
});

router.post('/add_school', (req, res) => {
  const sql = "INSERT INTO school (`name`) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) {
      console.error("Query Error:", err); // Log the error for debugging
      return res.json({ Status: false, Error: `Query Error: ${err.message}` });
    }
    return res.json({ Status: true });
  });
});

router.delete('/school/:id', (req, res) => {
  const sql = "DELETE FROM school WHERE id = ?";
  con.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("Query Error:", err); // Log the error for debugging
      return res.json({ Status: false, Error: `Query Error: ${err.message}` });
    }
    return res.json({ Status: true });
  });
});

router.put('/school/:id', (req, res) => {
  const sql = "UPDATE school SET name = ? WHERE id = ?";
  con.query(sql, [req.body.name, req.params.id], (err, result) => {
    if (err) {
      console.error("Query Error:", err); // Log the error for debugging
      return res.json({ Status: false, Error: `Query Error: ${err.message}` });
    }
    return res.json({ Status: true });
  });
});




// Image upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Public/Images');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer(
{ storage: storage });

//add employee

router.post('/add_employee', upload.single('image'), (req, res) => {
  const { name, email, password, address, category_id } = req.body;

  // Check if all required fields are present
  if (!name || !email || !password || !address || !req.file || !category_id) {
    return res.json({ Status: false, Error: "All fields are required." });
  }

  const sql = `INSERT INTO employee 
  (name, email, password, address, image, category_id) 
  VALUES (?)`;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.json({ Status: false, Error: "Password hashing error" });

    const values = [
      name,
      email,
      hash,
      address,
      req.file.filename,
      category_id
    ];

    con.query(sql, [values], (err, result) => {
      if (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.json({ Status: false, Error: "Invalid category_id. The category does not exist." });
        }
        return res.json({ Status: false, Error: err.message });
      }
      return res.json({ Status: true });
    });
  });
});


router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee 
        set name = ?, email = ?, address = ?, category_id = ? 
        Where id = ?`
    const values = [
        req.body.name,
        req.body.email,
        req.body.address,
        req.body.category_id
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from employee where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

  // school client crud 

  
router.post('/add_client', upload.fields([
  { name: 'pre_image', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), (req, res) => {
  const { type, school_id, division, uniform_id, gender } = req.body;

  // Check if all required fields are present
  if (!type || !school_id || !division || !uniform_id || !gender || !req.files['pre_image'] || !req.files['logo']) {
    return res.json({ Status: false, Error: "All fields are required." });
  }

  const sql = `INSERT INTO client 
  (type, school_id, division, uniform_id, gender, pre_image, logo) 
  VALUES (?)`;

  const values = [
    type,
    school_id,
    division,
    uniform_id,
    gender,
    req.files['pre_image'][0].filename,
    req.files['logo'][0].filename
  ];

  con.query(sql, [values], (err, result) => {
    if (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.json({ Status: false, Error: "Invalid category_id. The category does not exist." });
      }
      return res.json({ Status: false, Error: err.message });
    }
    return res.json({ Status: true });
  });
});

router.get('/client', (req, res) => {
  const sql = "SELECT * FROM client";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    return res.json({Status: true, Result: result})
  })
});

router.get('/client/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM client WHERE id = ?";
  con.query(sql,[id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    return res.json({Status: true, Result: result})
  })
});

router.put('/edit_client/:id', (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE client 
      set type = ?, school_id = ?, division = ?, uniform_id = ?, gender = ?
      Where id = ?`
  const values = [
      req.body.type,
      req.body.school_id,
      req.body.division,
      req.body.uniform_id,
      req.body.gender,
  ]
  con.query(sql,[...values, id], (err, result) => {
      if(err) return res.json({Status: false, Error: "Query Error"+err})
      return res.json({Status: true, Result: result})
  })
})



router.delete('/delete_client/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM client WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err})
    return res.json({Status: true, Result: result})
  })
});


//b2b client

  
router.post('/add_business', upload.fields([
  { name: 'pre_image', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), (req, res) => {
  const { name, division, department, occupation, gender } = req.body;

  // Check if all required fields are present
  if (!name || !division || !department  || !occupation || !gender || !req.files['pre_image'] || !req.files['logo']) {
    return res.json({ Status: false, Error: "All fields are required." });
  }

  const sql = `INSERT INTO business 
  (name, division, department, occupation, gender, pre_image, logo) 
  VALUES (?)`;

  const values = [
    name,
    division,
    department,
    occupation,
    gender,
    req.files['pre_image'][0].filename,
    req.files['logo'][0].filename
  ];

  con.query(sql, [values], (err, result) => {
    if (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.json({ Status: false, Error: "Invalid category_id. The category does not exist." });
      }
      return res.json({ Status: false, Error: err.message });
    }
    return res.json({ Status: true });
  });
});

router.get('/business', (req, res) => {
  const sql = "SELECT * FROM business";
  con.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    return res.json({Status: true, Result: result})
  })
});

router.get('/business/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM business WHERE id = ?";
  con.query(sql,[id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    return res.json({Status: true, Result: result})
  })
});

router.put('/edit_business/:id', (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE business 
      set name = ?, division = ?, department = ?, occupation = ?, gender = ?
      Where id = ?`
  const values = [
      req.body.name,
      req.body.division,
      req.body.department,
      req.body.occupation,
      req.body.gender,
  ]
  con.query(sql,[...values, id], (err, result) => {
      if(err) return res.json({Status: false, Error: "Query Error"+err})
      return res.json({Status: true, Result: result})
  })
})



router.delete('/delete_business/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM business WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err})
    return res.json({Status: true, Result: result})
  })
});
  
  // admin page details 
router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee_count', (req, res) => {
    const sql = "select count(id) as employee from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/salary_count', (req, res) => {
    const sql = "select sum(salary) as salaryOFEmp from employee";
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

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

export {router as adminRouter}
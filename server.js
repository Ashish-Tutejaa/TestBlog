const express = require('express');
const validator = require('validator');
const mysql = require('mysql'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = require('./config').secret;
const DB_PASS = require('./config').pass;
const uuid = require('uuid');

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : DB_PASS,
    database : 'blog'
})

connection.connect(function(err){
if(err)
    console.log(err);
else 
    console.log('connected to DB');
});

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded());
app.use((req,res,next) => {
    console.log(req.method);
    console.log(req.ip);
    console.log(req.hostname);
    console.log(req.headers);
    console.log(req.cookies);
    console.log(req.params);
    console.log(req.body);
    next();
})

 // AUTH MIDDLEWARE FOR PRVIATE ROUTES

 const auth = (req,res,next) => {
    if(req.headers['authorization'] === undefined){
        res.status(401);
        res.json({err : "Incorrect Auth detected"});
    } else {
        var token = (req.headers['authorization']).split(" ")[1];
        token = token.substr(1,token.length - 2);
        jwt.verify(token,secret, (err,decoded) => {
            if(err){
            res.status(401);
            console.log('resp sent1');
            res.json({err : "Invalid Login detected."});
            } else {
                const uid = decoded.userID;
                req.UID = uid;
                next();
            }
        })
    }
 }


 // END

app.get('/netPosts', auth, (req,res) => {
    connection.query(`SELECT UID,UNAME,EMAIL,PASS,PID,ACCESS,TITLE,_DESC
    FROM (USERS INNER JOIN POSTS ON USERS.UID = POSTS._OWNER)
    WHERE ACCESS = 'Public' AND UID IN (
        SELECT TOUID
        FROM FRIENDS
        WHERE FROMUID = ?
    )`,[req.UID], (err, results, fields) => {
        if(err){
            console.log(err);
            res.status(400);
            res.json({err : "An internal error occurred."});
        } else {
            res.status(200);
            res.json({posts : results})
        }
    })
})

app.delete('/deletePosts', auth, (req,res) => {
    console.log("DELETE ITEMS: ", req.body);
    connection.query("DELETE FROM POSTS WHERE PID IN (?)",[req.body], (err,results,fields) => {
        if(err){
            console.log(err);
            res.status(400);
            res.json({err : "Could not delete items."});
        } else {
            res.status(200);
            res.json({success : "Deleted succesfully"});
        }
    })
})

app.post('/addPost', auth, (req,res) => {
const {ACCESS,TITLE,_DESC} = req.body;
const PID = uuid.v1();

    if(!ACCESS || !TITLE || !_DESC){
        res.status(400);
        res.json({err : "Invalid Request Detected"});
    } else {
       connection.query("INSERT INTO POSTS (PID,_OWNER,ACCESS,TITLE,_DESC) VALUES (?,?,?,?,?)",[PID,req.UID,ACCESS,TITLE,_DESC], (err,results,fields) => {
           if(err){
                res.status(400);
                console.log(err);
                res.json({err : "An internal error occurred"});
           } else {
               res.status(200);
               res.json({newPost : {PID, _OWNER : req.UID, ACCESS, TITLE, _DESC}});
           }
       })
    }
})

app.get('/user/posts', auth, (req, res) => {
    connection.query(`SELECT UID,UNAME,EMAIL,PASS,PID,ACCESS,TITLE,_DESC
        FROM (USERS INNER JOIN POSTS ON USERS.UID = POSTS._OWNER)
        WHERE UID = ?`,[req.UID],function(err,results,fields){
        if(err){
            res.status(400);
            console.log('resp sent2');
            res.json({err : "Internal error detected."});
        } else {
            res.status(200);
            console.log('resp sent3');
            res.json({posts : results});
        }
    })
})

app.get('/getFollowing', auth, (req,res,next) => {
    console.log("GET FLLOWING REQUEST");
    connection.query("SELECT TOUID FROM FRIENDS WHERE FROMUID = ?",[req.UID], (err,results,fields) => {
        if(err){
            res.status(400);
            res.json({err : "An Internal Error Occurred."})
        } else {
            res.status(200);
            res.json({following : results})
        }
    })
})

app.get('/doesFollow/:v/:toggle?', auth, (req,res,next) => {
    console.log('OVEr HERE', req.params)
    if(!req.params.v){
        res.status(400);
        res.json({err : "Invalid to UID"})
    }

        connection.query("SELECT * FROM FRIENDS WHERE FROMUID = ? AND TOUID = ?",[req.UID,req.params.v], (err,results,fields) => {
            if(err){
                console.log(err);
                res.status(400);
                res.json({err : "Invalid user ID"});
            } else {

                if(req.params.toggle){
                    console.log("TOGGLING")
                    if(results.length === 0){

                        connection.query("INSERT INTO FRIENDS(TOUID,FROMUID) VALUES (?,?)",[req.params.v,req.UID], (err,results,fields) => {
                            if(err){
                                console.log(err);
                                res.status(500);
                                res.json({err : "Internal Server Id"})
                            } else {
                                res.status(200);
                                res.json({success : true});
                            }
                        })

                    } else {
                        
                        connection.query("DELETE FROM FRIENDS WHERE TOUID = ? AND FROMUID = ?",[req.params.v,req.UID], (err,results,fields) => {
                            if(err){
                                console.log(err);
                                res.status(500);
                                res.json({err : "Internal Server Id"})
                            } else {
                                res.status(200);
                                res.json({success : true});
                            }
                        })

                    }
                } else {
                res.status(200);
                res.json({follow : results.length !== 0});
                }
            }
        })

})

app.get('/getName/:userIdent', (req,res,next) => {
    console.log("GET NAME!")
    if(!req.params.userIdent){
        res.status(400);
        res.json({err : "Invalid user ID"});
    }
    connection.query("SELECT UNAME FROM USERS WHERE UID = ?",[req.params.userIdent], (err,results,fields) => {
        if(err){
            console.log(err);
            res.status(500);
            res.json({err : "Invalid user ID"});
        } else {
            res.status(200);
            res.json({name : results});
        }
    })
})

app.get('/getPublicPosts/:userIdent?', (req,res,next) => {
    var sqlquery = `SELECT UID,UNAME,EMAIL,PASS,PID,ACCESS,TITLE,_DESC
    FROM (USERS INNER JOIN POSTS ON USERS.UID = POSTS._OWNER)
    WHERE ACCESS = ?`;
    var sqlparams = ['Public'];
    if(req.params.userIdent){
        console.log('ident detected');
        sqlquery = sqlquery + " AND UID = ?";
        sqlparams.push(req.params.userIdent);
    }
    connection.query(sqlquery,sqlparams,
    function(err,result,fields)
        {
        if(err)
            {
            console.log(err);
            res.status(400);
            res.json({err : "sorry an error occurred"})
            }
        else 
            {
            res.status(200);
            res.json(result);
            }
        })
})

app.post('/registerUser', (req,res) => {
    const {email, uname, pass} = req.body;
    if(validator.isEmail(email)){
        connection.query("SELECT * FROM USERS WHERE USERS.EMAIL = ?",[email], function(err, results, fields){
            if(err){
            console.log(err);
            res.status(400);
            res.json({err : "sorry an internal error occurred.  please try again later."});  
            } else if(results.length > 0){
            res.status(400);
            res.json({err : "This email is already taken."});
            } else{

                bcrypt.genSalt(10, (err,salt) => {
                    bcrypt.hash(pass,salt,(err,hash) => {
                        var uid = uuid.v1();
                        connection.query("INSERT INTO USERS(UID,EMAIL,UNAME,PASS) VALUES (?,?,?,?)",[uid,email,uname,hash], function(err1,results1,fields1){
                            if(err1){
                                console.log(err1);
                            res.status(400);
                            res.json({err1 : "sorry an internal error occurred.  please try again later."});
                            } else {
                            console.log("HEREEEE: ", results1);
                                jwt.sign({userID : uid},secret,{expiresIn : 86400},(err,token) => {
                                    console.log(token);
                                    if(err){
                                        res.status(400);
                                        res.json({err : "an internal error occurred. please try again"});
                                    } else {
                                        res.status(200);
                                        res.json({token : token});
                                    }
                                });
                            }
                        }) 
                    })
                })

            }
        })
    } else {
        console.log("HERE:",req.body);
        res.json({err : "Invalid email address detected."});
    }
})

app.post('/loginUser', (req,res) => {
    const {email, uname, pass} = req.body;
    if(validator.isEmail(email)){
        connection.query("SELECT * FROM USERS WHERE EMAIL = ?",[email],function(err,results,fields){
            console.log(results);
            if(err){
                res.status(400); 
                res.json({err : "An internal error occurred.  Please try again."});
            } else if (results.length === 0){
                res.status(400);
                res.json({err : "No such email found"});
            } else {
                console.log(req.body);
                console.log(results);
                console.log(results[0].PASS);
                bcrypt.compare(pass,results[0].PASS, function(err,isSame){
                    if(err){
                        res.status(400);
                        res.json({err : "An internal error occurred"});
                    } else if(!isSame){
                        res.status(400);
                        res.json({err : "Invalid Password"});
                    } else {
                        console.log(results.PASS);
                        jwt.sign({userID : results[0].UID},secret,{expiresIn : 86400},(err,token) => {
                            console.log(token);
                            if(err){
                                res.status(400);
                                res.json({err : "an internal error occurred. please try again"});
                            } else {
                                res.status(400);
                                res.json({token : token});
                            }
                        });
                    }
                })
            }   
        })

    } else {
    res.status(400);
    res.json({err : "invalid email detected."})
    }
})

app.listen(port, () => {console.log(`running@${port}`)});

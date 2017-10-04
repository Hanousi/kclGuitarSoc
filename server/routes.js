var fs = require('fs');
var express = require('express');
var validator = require('express-validator');
var lessons = require('./models/lessons.js');
var users = require('./models/user.js');
var bodyParser = require('body-parser');
var express = require('express');
var session = require('express-session');
var async = require('async');
var upload = require('multer')({
    dest: './uploads/'
});
var validationConf = require('./config/validation.js');
var util = require('util');


module.exports = function (app, passport) {

    app.use(express.static('app'));
    app.use('/bower_components', express.static('bower_components'));


    var guestAuth = function (req, res, next) {
        if (req.user) return next();
        req.session.save((err) =>
            users.createGuest(req.sessionID, (err, user) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                } else req.logIn(user, next);
            })
        );
    }
    app.use(guestAuth);

    var authLevel = function (accessGroup) {
        return function (req, res, next) {
            if (req.user.AccessGroup <= accessGroup) next();
            else {
                res.sendStatus(401);
                console.log(req);
            }
        };
    };

    var validateSchemas = function (schemas) {
        return function (req, res, next) {
            schemas.forEach((schema) => req.check(schema));
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
                } else next();
            });

        };

    }

    var validateSchemasIf = function (condition, schemas) {
        return function (req, res, next) {
            if (!condition(req)) return next();
            schemas.forEach((schema) => req.check(schema));
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
                } else next();
            });

        };

    }

    var validateContentType = function (req, res, next) {
        if (req.header('x-insert-type') == 'BULK') return next();
        req.checkHeaders('content-type', 'Content type should be application/json when x-insert-type header is not BULK').contains('application/json');
        req.getValidationResult().then(function (result) {
            if (!result.isEmpty()) {
                res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
            } else next();
        });
    };


    var validateUserID = function (req, res, source, callback) {
        if (source == 'BODY') {
            req.checkBody('userID', 'Must provide only one string ID').isString();
            req.getValidationResult().then(function (result) {
                if (!result.isEmpty()) {
                    res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
                    callback(false);
                } else callback(true);
            });
        } else callback(true);
    }

    var requestFor = function (type, source) {
        switch (type) {
        case 'USER|ADMIN':
            return function (req, res, next) {
                var userID = req.params.userID;
                if (req.user.UserID == userID || req.user.AccessGroup == 0) return next();
                res.sendStatus(401);

            };

        case 'BUILDOWNER':
            return function (req, res, next) {
                degrees.getOwner(req.params.buildID, (err, userID) => {
                    if (err) {
                        if (err.message == 'BUILD_DOESN\'T_EXIST') {
                            res.statusMessage = 'Build doesn\'t exist';
                            res.sendStatus(404);
                        } else {
                            console.error(err);
                            res.sendStatus(500);
                        }
                    } else if (userID == req.user.UserID) next();
                    else res.sendStatus(401);
                });
            };

        default:
            return function (req, res, next) {
                var userID = (source == 'BODY' ? req.body.userID : req.params.userID);
                validateUserID(req, res, source, (valid) => {
                    if (!valid) return;
                    if (req.user.UserID == userID) return next();
                    res.sendStatus(401);
                });
            };
        }
    };

    var validateToken = function (req, res, next) {
        users.validateToken(req.body.token, function (err, isValid, userID) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else if (isValid) {
                req.body.userID = userID;
                next();
            } else {
                res.statusMessage = 'Token invalid or expired';
                res.sendStatus(401);
            }
        });
    };

    var deleteTempFile = function (path) {
        fs.unlink(path, (err) => {
            console.log('Successfully deleted ' + path + 'if error is null/undefined: ' + err);
        });
    }
    // Users //// ****************************************************************************************************************************************************************

    /**
     * @api {get} /api/users Get the users by access group.
     * @apiDescription Can specify multiple access groups, one access group or nothing. If nothing is specified retrieves all users. Only administrators can use this.
     *
     * @apiExample Example usage :
     *	/api/users?access_group=0&access_group=2
     *
     * @apiName GetUsers
     * @apiGroup User
     *
     * @apiParam {string} access_group - The access level of users wanted : 0 for administrators, 1 for moderators or 2 for students.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     *
     */
    app.get("/api/users", authLevel(0), validator(validationConf.GROUP_OPTIONS), validateSchemas([validationConf.GROUP_SCHEMA]), function (req, res) {
        users.getUsers(req.query.access_group, function (err, data) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else res.send(data);
        });
    });


    /**
     * @api {post} /api/users Add users.
     *
     * @apiExample Example usage :
     *	/api/users
     * { userID : "david.smith@gmail.com", fName : "David", lName : "Smith", password : "password"} in json form.
     *
     * @apiName AddUsers
     * @apiGroup User
     *
     * @apiParam {string} userID - The user's email.
     * @apiParam {string} fName - The user's first name.
     * @apiParam {string} lName - The user's last name.
     * @apiParam {string} password - The user's password.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     * @apiError USER_EXISTS The user already exists or the email is taken.
     * @apiErrorExample :
     * HTTP/1.1 409 User Exists
     */
    app.post("/api/users", bodyParser.json(), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.USER_SCHEMA]), function (req, res) {
        users.addUser(req.body.userID, req.body.fName, req.body.lName, req.body.password, 2, function (err, data) {
            if (err) {
                if (err.message == 'USER_EXISTS') res.sendStatus(409);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else {
                res.setHeader('Location', '/api/users/' + req.body.userID);
                res.sendStatus(201);
            }
        });
    });

    app.post("/api/verifyAccount", bodyParser.json() , function (req, res) {
        users.verifyAccount(req.body.userID, function (err, data) {
            if (err) {
                if (err.message == 'USER_EXISTS') res.sendStatus(409);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            }
        });
    });

    /**
     * @api {put} /api/users/:userID Update a user.
     * @apiDescription Can update one or more values. The old userID must be passed in the parameters.
     * @apiExample Example usage :
     *	/api/users/studentemail@kcl.ac.uk
     * { userID : "david.smith@gmail.com", fName : "David", lName : "Smith", password : "password"} in json form.
     *
     * @apiName UpdateUsers
     * @apiGroup User
     *
     * @apiParam {string} userID - The user's new email or old email.
     * @apiParam {string} fName - The user's first name.
     * @apiParam {string} lName - The user's last name.
     * @apiParam {string} password - The user's password.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     * @apiError USER_EXISTS The user already exists or the email is taken.
     * @apiErrorExample :
     * HTTP/1.1 409 User Exists
     */
    app.put("/api/users/:userID", bodyParser.json(), authLevel(2), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.USER_UPDATE_SCHEMA]),
        requestFor('USER', 'PARAMS'),
        function (req, res) {
            users.updateUser(req.params.userID, req.body.userID, req.body.fName, req.body.lName, function (err) {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                } else {
                    res.setHeader('Location', '/api/users/' + req.body.userID);
                    res.sendStatus(200);
                }
            });
        });


    /**
     * @api {delete} /api/users/:userID Delete a user.
     * @apiExample Example usage :
     *	/api/users/studentemail@kcl.ac.uk
     *
     * @apiName DeleteUsers
     * @apiGroup User
     *
     * @apiParam {string} userID - The user's email.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     */
    app.delete("/api/users/:userID", authLevel(2), requestFor('USER|ADMIN'), function (req, res, next) {
        users.deleteUser(req.params.userID, function (err, data) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                req.session.cookie.maxAge = 1000 * 3600 * 24 * 7;
                res.cookie(
                    'connect.sid',
                    req.cookies["connect.sid"], {
                        maxAge: req.session.cookie.maxAge,
                        expires: req.session.cookie.expires,
                        path: '/',
                        httpOnly: true
                    }

                );
                next();
            }
        });
    }, guestAuth, function (req, res) {
        res.cookie('selector_user', req.user, {
            maxAge: req.session.cookie.maxAge,
            expires: req.session.cookie.expires,
            httpOnly: false
        });
        res.sendStatus(204);

    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    app.get("/api/lessons", function (req, res) {
        lessons.getLessons(function (err, data) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else res.send(data);
        });
    });

    app.post("/api/lessons", bodyParser.json(), authLevel(1), function (req, res) {
        lessons.createLesson(req.body.teacherId, req.body.teacherName, req.body.year, req.body.month, req.body.day, req.body.startTime, req.body.endTime, req.body.building, req.body.room, req.body.available, req.body.studentId, req.body.studentName, function (err, data) {
            if (err) {
                if (err.code == 'ER_DUP_ENTRY') res.sendStatus(409);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else {
                res.setHeader('Location', '/api/lessons/' + req.body.tagName);
                res.sendStatus(201);
            }
        });
    });

    app.get("/api/lessons/:month", function (req, res) {
        lessons.getLessonByMonth(req.params.month, function (err, data) {
            if (err) {
                if (err.message == 'NOT_FOUND') res.sendStatus(404);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else res.send(data);
        });
    });

    app.get("/api/user/lessons/:teacherId/:studentId/:month/:nextMonth/:year/:nextYear", function (req, res) {
        lessons.getUserLessons(req.params.teacherId, req.params.studentId, req.params.month, req.params.nextMonth, req.params.year, req.params.nextYear, function (err, data) {
            if (err) {
                if (err.message == 'NOT_FOUND') res.sendStatus(404);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else res.send(data);
        });
    });

    app.post('/verify', bodyParser.json(), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.USERID_EMAIL_SCHEMA]), function (req, res) {
        users.verification(req.headers.host, req.body.userID, req.body.token, function (err) {
            if (err) {
                if (err.message == 'USER_DOESN\'T_EXIST') res.sendStatus(401);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else res.sendStatus(200);
        });
    });

    app.get("/api/lesson/:lessonId", function (req, res) {
        lessons.getLessonById(req.params.lessonId, function (err, data) {
            if (err) {
                if (err.message == 'NOT_FOUND') res.sendStatus(404);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else res.send(data);
        });
    });

    app.get("/api/code/:userId", function (req, res) {
        users.getCode(req.params.userId, function (err, data) {
            if (err) {
                if (err.message == 'NOT_FOUND') res.sendStatus(404);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else res.send(data);
        });
    });

    app.get("/api/lessons/:month/:year", function (req, res) {
        lessons.getLessonByMonthAndYear(req.params.month, req.params.year, function (err, data) {
            if (err) {
                if (err.message == 'NOT_FOUND') res.sendStatus(404);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else res.send(data);
        });
    });

    app.put("/api/lesson", bodyParser.json(), authLevel(2), function (req, res) {
        console.log(req.body.StudentID);
        console.log(req.body.StudentName);
        console.log(req.body.LessonID);

        lessons.bookLesson(req.body.StudentID, req.body.StudentName, req.body.LessonID, function (err) {
            if (err) {
                if (err.message == 'NOT_FOUND') res.sendStatus(404);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else res.sendStatus(204);
        });
    });

    // Authentication routes  //// ***********************************************************************************************************************************************

    /**
     * @api {get} /logged_in Retrieve the currently logged in user's details if any.
     * @apiDescription If no user is logged in returns null.
     *
     * @apiExample Example usage :
     *	/logged_in
     *
     * @apiName SignUp
     * @apiGroup Authentication
     *
     *
     * @apiSuccessExample Success-Response:
     *  {UserID : "studentemail@kcl.ac.uk", FName : "Student", Lname : "Name", AccessGroup: 2}
     *
     */
    app.get("/logged_in", function (req, res) {

        res.cookie('selector_user', req.user, {
            maxAge: req.session.cookie.maxAge,
            expires: req.session.cookie.expires,
            httpOnly: false
        });
        res.send(req.user);
    });

    /**
     * @api {get} /has_permissions/:accessGroup Check a user's permissions.
     * @apiDescription Need to specify the access group as a parameter. Returns null if the user is not authenticated.
     *
     * @apiExample Example usage :
     *	/has_permissions/1
     *
     * @apiName SignUp
     * @apiGroup Authentication
     *
     * @apiParam {string} accessGroup The user's access group.
     *
     * @apiSuccessExample Success-Response:
     *  {UserID : "studentemail@kcl.ac.uk", AccessGroup : 2}
     *
     */
    app.get("/has_permissions/:accessGroup", validator(), validateSchemas([validationConf.PARAMS_GROUP_SCHEMA]), function (req, res) {
        if (req.user.AccessGroup <= req.params.accessGroup) res.send(req.user);
        else res.send('null');
    });

    /**
     * @api {post} /login Log in a user.
     * @apiDescription Need to specify the userID and password of the user in the body in json form. Makes a cookie for the user to keep information accross pages.
     *
     * @apiExample Example usage :
     *	/login
     * { userID : "moderatoremail@kcl.ac.uk", password : "password"} in json form.
     *
     * @apiName LogIn
     * @apiGroup Authentication
     *
     * @apiParam {string} userID The email of the user.
     * @apiParam {string} password The user's password.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     */
    app.post('/login', bodyParser.json(), validator(), function (req, res, next) {
            req.query.userID = req.body.userID;
            req.query.password = req.body.password;
            next();
        }, passport.authenticate('local-login'),
        function (req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 3600 * 24 * 7;
            } else {
                req.session.cookie.expires = false;
            }
            res.cookie(
                'connect.sid',
                req.cookies["connect.sid"], {
                    maxAge: req.session.cookie.maxAge,
                    expires: req.session.cookie.expires,
                    path: '/',
                    httpOnly: true
                }
            );
            console.log('hi');
            res.cookie('selector_user', req.user, {
                maxAge: req.session.cookie.maxAge,
                expires: req.session.cookie.expires,
                httpOnly: false
            });
            console.log('hi2')
            res.sendStatus(200);
        });


    /**
     * @api {post} /signup Sign up a user.
     * @apiDescription Need to specify the userID, first name, last name, password of the user in the body in json form.
     *
     * @apiExample Example usage :
     *	/signup
     * { userID : "moderatoremail@kcl.ac.uk", fName : "Moderator", lName : "Bond" , password : "password"} in json form.
     *
     * @apiName SignUp
     * @apiGroup Authentication
     *
     * @apiParam {string} userID The email of the user.
     * @apiParam {string} password The user's password.
     * @apiParam {string} fName The user's first name.
     * @apiParam {string} lName The user's last name.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     */
    app.post('/signup', bodyParser.json(), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.USER_SCHEMA]), function (req, res, next) {
        req.query.userID = req.body.userID;
        req.query.password = req.body.password;
        next();
    }, passport.authenticate('local-signup'), function (req, res) {
        res.cookie('selector_user', req.user, {
            maxAge: req.session.cookie.maxAge,
            expires: req.session.cookie.expires,
            httpOnly: false
        });
        res.sendStatus(200);
    });


    /**
     * @api {post} /reset_password Reset a user's password once the user has received his token by email.
     * @apiDescription Need to specify the userID and password of the user in the body in json form.
     *
     * @apiExample Example usage :
     *	/reset_password
     * { userID : "moderatoremail@kcl.ac.uk", password : "password"} in json form.
     *
     * @apiName ResetPassword
     * @apiGroup Authentication
     *
     * @apiParam {string} userID The email of the user.
     * @apiParam {string} password The user's password.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     */
    app.post('/reset_password', bodyParser.json(), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.PASSWORD_SCHEMA]), validateToken, function (req, res) {
        users.resetPassword(req.body.userID, req.body.password, function (err) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else res.sendStatus(200);
        });
    });

    /**
     * @api {post} /change_password Change a user's password.
     * @apiDescription Need to specify the userID and password of the user in the body in json form.
     *
     * @apiExample Example usage :
     *	/change_password
     * { userID : "moderatoremail@kcl.ac.uk", password : "password"} in json form.
     *
     * @apiName ChangePassword
     * @apiGroup Authentication
     *
     * @apiParam {string} userID The email of the user.
     * @apiParam {string} password The user's password.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     * @apiError USER_DOESNT_EXIST The userID is not correct.
     * @apiErrorExample :
     * HTTP/1.1 404 Not Found
     *
     */
    app.post('/change_password', bodyParser.json(), authLevel(2), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.PASSWORD_SCHEMA, validationConf.USERID_SCHEMA]),
        requestFor('USER', 'BODY'),
        function (req, res) {
            users.resetPassword(req.body.userID, req.body.password, function (err) {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                } else res.sendStatus(200);
            });
        });


    /**
     * @api {put} /reset_access_group Reset the access group of a user.
     * @apiDescription Need to specify the host of the web application as a header and the userID in json form in the body.
     *
     * @apiExample Example usage :
     *	/reset_access_group
     * { userID : "moderatoremail@kcl.ac.uk", accessGroup : 1} in json form.
     *
     * @apiName ResetAccessGroup
     * @apiGroup Authentication
     *
     * @apiParam {string} userID The email of the user.
     * @apiParam {string} accessGroup The new access group of the user.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 204
     *
     * @apiError USER_DOESNT_EXIST The userID is not correct.
     * @apiErrorExample :
     * HTTP/1.1 404 Not Found
     *
     */
    app.put('/reset_access_group', bodyParser.json(), authLevel(0), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.ACCESS_RESET_SCHEMA]),
        function (req, res) {
            users.setAccessGroup(req.body.userID, req.body.accessGroup, function (err) {
                if (err) {
                    if (err.message == 'USER_DOESN\'T_EXIST') res.sendStatus(404);
                    else {
                        console.error(err);
                        res.sendStatus(500);
                    }
                } else res.sendStatus(204);
            });
        });

    /**
     * @api {post} /request_reset Request the reset of the password associated with userID.
     * @apiDescription Need to specify the host of the web application as a header and the userID in json form in the body.
     *
     * @apiExample Example usage :
     *	/request_reset
     * { userID : "studentemail@kcl.ac.uk"} in json form.
     *
     * @apiName RequestReset
     * @apiGroup Authentication
     *
     * @apiParam {string} host The host on which the web application is.
     * @apiParam {string} userID The email of the user.
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     * @apiError Unauthorized The userID is not correct.
     * @apiErrorExample :
     * HTTP/1.1 401 Unauthorized
     *
     */
    app.post('/request_reset', bodyParser.json(), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.USERID_EMAIL_SCHEMA]), function (req, res) {
        users.requestReset(req.headers.host, req.body.userID, function (err) {
            if (err) {
                if (err.message == 'USER_DOESN\'T_EXIST') res.sendStatus(401);
                else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else res.sendStatus(200);
        });
    });

    /**
     * @api {get} /logout Log out.
     * @apiDescription Logs out user but adds a cookie to keep his information for a some amount of time.
     *
     * @apiExample Example usage :
     *	/logout
     *
     * @apiName Logout
     * @apiGroup Authentication
     *
     * @apiSuccessExample Success-Response:
     *  HTTP/1.1 200 OK
     *
     */
    app.get('/logout', function (req, res, next) {
        req.logout();
        req.session.cookie.maxAge = 1000 * 3600 * 24 * 7;
        res.cookie(
            'connect.sid',
            req.cookies["connect.sid"], {
                maxAge: req.session.cookie.maxAge,
                expires: req.session.cookie.expires,
                path: '/',
                httpOnly: true
            }

        );
        next();
    }, guestAuth, function (req, res) {
        res.cookie('selector_user', req.user, {
            maxAge: req.session.cookie.maxAge,
            expires: req.session.cookie.expires,
            httpOnly: false
        });
        res.sendStatus(200);
    });
}

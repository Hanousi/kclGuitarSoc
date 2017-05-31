var getConnection = require('../config/connect_db.js').getConnection;
var async = require('async');
var csvParser = require('csv-parse');
var fs = require('fs');

exports.getLessons = function (callback) {
    getConnection((err, connection) => {
        if (err) callback(err);
        else {
            connection.query('SELECT * FROM Lesson', function (err, rows, fields) {
                callback(err, rows);
                connection.release();
            });
        }

    });
};

exports.createLesson = function (teacherId, teacherName, year, month, day, startTime, endTime, building, room, available, studentId, studentName, callback) {
    getConnection((err, connection) => {
        if (err) callback(err);
        else {
            connection.query('INSERT INTO Lesson (TeacherID, TeacherName, Year, Month, Day, StartTime, EndTime, Building, Room, Available, StudentID, StudentName) VALUES ((?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?))', [teacherId, teacherName, year, month, day, startTime, endTime, building, room, available, studentId, studentName], function (err, rows, fields) {
                if (!err) {
                    callback(err, rows);
                } else {
                    callback(err);
                }
                connection.release();
            });
        }

    });
};

exports.getLessonByMonth = function (month, callback) {
    var connectionHandle;
    async.waterfall([(done) => getConnection((err, connection) => {
            connectionHandle = connection;
            done(err, connection);
        }),
        (connection, done) => connection.query('SELECT *, DATE_FORMAT(StartTime, \'%H:%i\') AS niceDateS, DATE_FORMAT(EndTime, \'%H:%i\') AS niceDateE FROM Lesson WHERE Month = (?)', [month], (err, rows) => done(err, rows)),
        (rows, done) => done((rows.length == 0 ? new Error('NOT_FOUND') : null), rows)], (err, rows) => {
        if (connectionHandle) connectionHandle.release();
        callback(err, rows);
    });
};

exports.getUserLessons = function (teacherId, studentId, month, nextMonth, year, nextYear, callback) {
    var connectionHandle;
    async.waterfall([(done) => getConnection((err, connection) => {
            connectionHandle = connection;
            done(err, connection);
        }),
        (connection, done) => connection.query('SELECT *, DATE_FORMAT(StartTime, \'%H:%i\') AS niceDateS, DATE_FORMAT(EndTime, \'%H:%i\') AS niceDateE FROM Lesson WHERE (TeacherID = (?) || StudentID = (?)) && (Month = (?) || Month = (?)) && (Year = (?) || Year = (?))', [teacherId, studentId, month, nextMonth, year, nextYear], (err, rows) => done(err, rows)),
        (rows, done) => done((rows.length == 0 ? new Error('NOT_FOUND') : null), rows)], (err, rows) => {
        if (connectionHandle) connectionHandle.release();
        callback(err, rows);
    });
};

exports.getLessonById = function (id, callback) {
    var connectionHandle;
    console.log(id);
    async.waterfall([(done) => getConnection((err, connection) => {
            connectionHandle = connection;
            done(err, connection);
        }),
        (connection, done) => connection.query('SELECT *, DATE_FORMAT(StartTime, \'%H:%i\') AS niceDateS, DATE_FORMAT(EndTime, \'%H:%i\') AS niceDateE FROM Lesson WHERE LessonID = (?)', [id], (err, rows) => done(err, rows)),
        (rows, done) => done((rows.length == 0 ? new Error('NOT_FOUND') : null), rows)], (err, rows) => {
        if (connectionHandle) connectionHandle.release();
        callback(err, rows);
    });
};

exports.getLessonByMonthAndYear = function (month, year, callback) {
    var connectionHandle;
    async.waterfall([(done) => getConnection((err, connection) => {
            connectionHandle = connection;
            done(err, connection);
        }),
        (connection, done) => connection.query('SELECT *, DATE_FORMAT(StartTime, \'%H:%i\') AS niceDateS, DATE_FORMAT(EndTime, \'%H:%i\') AS niceDateE FROM Lesson WHERE Month = (?) && Year = (?)', [month, year], (err, rows) => done(err, rows)),
        (rows, done) => done((rows.length == 0 ? new Error('NOT_FOUND') : null), rows)], (err, rows) => {
        if (connectionHandle) connectionHandle.release();
        callback(err, rows);
    });
};

exports.bookLesson = function (studentId, studentName, lessonId, callback) {
    var connectionHandle;
    async.waterfall([(done) => getConnection((err, connection) => {
            connectionHandle = connection;
            done(err, connection);
        }),
        (connection, done) => connection.query('UPDATE Lesson SET StudentID = (?), StudentName = (?), Available = 0 WHERE LessonID = (?)', [studentId, studentName, lessonId], (err, rows) => {
            var error = err;
            if (!err && rows.affectedRows === 0) error = new Error('NOT_FOUND');
            done(error);
        })], (err) => {
        if (connectionHandle) connectionHandle.release();
        callback(err);
    });
};
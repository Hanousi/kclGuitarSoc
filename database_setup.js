var async = require('async');
var bcrypt = require('bcrypt');
var db = require('./server/config/connect_db.js');
 
var createConnection = function (callback) {
    db.getConnection(function (err, connection) {
        if (err) return callback(err);
        callback(null, connection);
    });
}
 
var createTables = function (connection, callback) {
    async.waterfall([(done) => connection.query('CREATE TABLE IF NOT EXISTS Session (' +
            'SessionID VARCHAR(128) NOT NULL,' +
            'Expires int(11) unsigned NOT NULL,' +
            'Data text,' +
            'PRIMARY KEY(SessionID))', (err) => done(err)),
                     
        (done) => connection.query('CREATE TABLE IF NOT EXISTS User (' +
            'UserID VARCHAR(100) NOT NULL UNIQUE,' +
            'FName VARCHAR(50),' +
            'LName VARCHAR(50),' +
            'Password CHAR(60) BINARY,' +
            'AccessGroup int,' +
            'SessionLink VARCHAR(128) UNIQUE,' +
            'Verified boolean NOT NULL,' +                       
            'PRIMARY KEY(UserID),' +
            'FOREIGN KEY(SessionLink) REFERENCES Session(SessionID)' +
            'ON DELETE CASCADE ON UPDATE CASCADE)', (err) => done(err)),
 
        (done) => connection.query('CREATE TABLE IF NOT EXISTS Lesson (' +
            'LessonID INT NOT NULL UNIQUE AUTO_INCREMENT,' +
            'TeacherID varchar(50) NOT NULL,' +
            'TeacherName VARCHAR(50) NOT NULL,' +
            'Year int(4) NOT NULL,' +
            'Month VARCHAR(20) NOT NULL,' +
            'Day int(2) NOT NULL,' +
            'StartTime time NOT NULL,' +
            'EndTime time NOT NULL,' +
            'Building VARCHAR(30) NOT NULL,' +
            'Room VARCHAR(30) NOT NULL,' +
            'Available boolean NOT NULL,' +
            'StudentID varchar(50),' +
            'StudentName varchar(50),' +
            'PRIMARY KEY(LessonID),' +
            'FOREIGN KEY(TeacherID) REFERENCES User(UserID)' +
            'ON DELETE CASCADE ON UPDATE CASCADE,' + 
            'FOREIGN KEY(StudentID) REFERENCES User(UserID)' +
            'ON DELETE CASCADE ON UPDATE CASCADE)', (err) => done(err)),
                    
        (done) => connection.query('CREATE TABLE IF NOT EXISTS Room (' +
            'RoomName varchar(30) NOT NULL UNIQUE,' +
            'BuildingName varchar(50) NOT NULL,' +
            'PRIMARY KEY(RoomName),' +
            'FOREIGN KEY(BuildingName) REFERENCES Building(BuildingName)' +
            'ON DELETE CASCADE ON UPDATE CASCADE)', (err) => done(err)),
                    
        (done) => connection.query('CREATE TABLE IF NOT EXISTS Building (' +
            'BuildingName varchar(50) NOT NULL UNIQUE,' +
            'Campus varchar(50),' +
            'PRIMARY KEY(BuildingName))', (err) => done(err)),
                    
                                         
        (done) => connection.query('CREATE TABLE IF NOT EXISTS Code (' +
            'UserID varchar(50) NOT NULL UNIQUE,' +
            'AccessCode varchar(50) NOT NULL UNIQUE,' +
            'PRIMARY KEY(UserID))', (err) => done(err))], (err) => callback(err, connection));
}
 
 
var setup = function (cb) {
    async.waterfall([
		createConnection,
		createTables], (err, connection) => {
        if (connection) connection.release();
        if (err) return cb(err);
 
        console.log('Database confirmed');
        cb();
    });
}
 
exports.refresh = setup;

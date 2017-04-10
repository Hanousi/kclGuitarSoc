var getConnection = require('../config/connect_db.js').getConnection;
var async = require('async');
var csvParser = require('csv-parse');
var fs = require('fs');

exports.getLessons = function(callback){
	getConnection( (err, connection) =>{
			if(err) callback(err);
			else{					
				connection.query('SELECT * FROM Lesson', function(err, rows, fields) {
					callback(err, rows);
        	connection.release();
				});
			}
					
	});
};

exports.createLesson = function(teacherName, month, day, startTime, endTime, available, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
				connection.query('INSERT INTO Lesson (TeacherName, Month, Day, StartTime, EndTime, Available) VALUES ((?), (?), (?), (?), (?), (?))', [teacherName, month, day, startTime, endTime, available], function(err, rows, fields) {
					if (!err){
						callback(err, rows);
					} else{
						callback(err);
					}        connection.release();
				});
			}
					
		});
}; 

exports.getLessonByMonth = function(month, callback){
	var connectionHandle;	
	async.waterfall([(done)=>getConnection( (err, connection) =>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT *, DATE_FORMAT(StartTime, \'%H:%i\') AS niceDateS, DATE_FORMAT(EndTime, \'%H:%i\') AS niceDateE FROM Lesson WHERE Month = (?)', [month],(err,rows)=> done(err,rows)),
									(rows, done)=>done((rows.length==0?new Error('NOT_FOUND'): null), rows)],
									(err, rows)=>{if(connectionHandle) connectionHandle.release();		
																callback(err, rows);
	});			
};
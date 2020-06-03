const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
}, async (req, username, password, done)=>{
	const rows = await pool.query('select * from users where name = ?',[username]);
	if (rows.length > 0) {
		const user = rows[0]
		const validPassword = await helpers.matchPassword(password, user.password);
		if (validPassword) {
			done(null, user, req.flash('success','Wellcome '+user.username));
		}else{
			done(null, false, req.flash('message','Incorrect Password'));
		}
	}else{
		return done(null, false, req.flash('message','Username doest not exist'));
	}
}));

passport.use('local.signup', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
}, async (req, username, password, done)=>{
	const { fullname } = req.body;
	const newUser = {
		name: fullname,
		mail: username,
		password
	}
	newUser.password = await helpers.encryptPassword(password);
	const result = await pool.query('insert into users set ?',[newUser]);
	newUser.idusers = result.insertId;
	return done(null, newUser);
}));

passport.serializeUser((user, done)=>{
	done(null, user.idusers);
});

passport.deserializeUser(async (id, done)=>{
	const rows = await pool.query('select * from users where idusers = ?',[id]);
	done(null, rows[0]);
});
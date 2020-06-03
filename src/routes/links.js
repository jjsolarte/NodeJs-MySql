const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res)=>{
	res.render('./links/add');
});

router.post('/add', async (req, res)=>{
	const { title, url, description } = req.body;
	const newLink = {
		title,
		url,
		description,
		users_idusers: req.user.idusers
	};
	await pool.query('insert into links set ?', [newLink]);
	req.flash('success', 'Link saved successfully');
	res.redirect('/links');
});

router.get('', isLoggedIn, async (req, res)=>{
	const links = await pool.query('select * from links where users_idusers = ?',[req.user.idusers]);
	res.render('../views/links/list', {links});
});

router.get('/delete/:id', async (req, res)=>{
	const {id} = req.params;
	await pool.query('delete from links where idlinks=?',[id]);
	req.flash('success', 'Link removed successfully');
	res.redirect('/links');
});

router.get('/edit/:id', isLoggedIn, async (req, res)=>{
	const {id} = req.params;
	const links = await pool.query('select * from links where idlinks = ? ',[id]);
	res.render('../views/links/edit',{links: links[0]});
});

router.post('/edit/:id', async (req, res)=>{
	const {id} = req.params;
	const {title, description, url} = req.body;
	const edtLink = {
		title,
		description,
		url
	}
	await pool.query('update links set ? where idlinks = ?',[edtLink, id]);
	req.flash('success', 'Link updated successfully');
	res.redirect('/links');
})

module.exports = router;
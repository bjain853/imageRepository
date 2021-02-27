const express = require('express');
const app = express();
const Datastore = require('nedb');
const fs = require('fs');

const pictures = new Datastore({ filename: 'db/pictures.db', autoload: true });
const comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData: true });
const users = new Datastore({ filename: 'db/users.db', autoload: true });

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
app.use(express.static('static'));
const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.use(
	session({
		secret: 'HolaGallery',
		resave: true,
		saveUninitialized: true,
		cookie: { maxAge: 10000 * 3600 * 24 }
	})
);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('static'));

app.use(function(req, res, next) {
	req.username = req.session ? req.session.username : null;
	console.log('HTTP request', req.method, req.username, req.url, req.body);
	next();
});

const ID = function() {
	return '_' + Math.random().toString(36).substr(2, 9);
};

const isAuthenticated = function(req, res, next) {
	if (!req.username) {
		return res.status(401).end('access denied');
	}
	next();
};

const canDeleteImage = function(req, res, next) {
	pictures.findOne({ _id: req.params.id }, function(err, image) {
		if (err) return res.status(500).json(err);
		else if (!image || !req.username || image.author !== req.username) return res.status(401).end('access denied');
		next();
	});
};

const canDeleteComments = function(req, res, next) {
	comments.findOne({ _id: req.params.id }, function(err, comment) {
		if (err) return res.status(500).json(err);
		else if (!comment || comment.author !== req.username) return res.status(401).end('access denied');
		next();
	});
};

let Comment = function(comment) {
	this._id = ID();
	this.imageId = comment.imageId;
	this.content = comment.content;
	this.author = comment.author;
	this.date = new Date();
};

let Picture = function(image, file) {
	this._id = ID();
	this.author = image.author;
	this.title = image.title;
	this.date = new Date();
	this.picture = file;
};

app.use(function(req, res, next) {
	console.log('HTTP request', req.method, req.url, req.body);
	next();
});

app.post('/api/signup/', function(req, res) {
	let username = req.body.username;
	let password = req.body.password;
	if(!username || !password){
		res.send(400).end("Username/Password not provided");
	}
	let salt = `#$^$&&^${username}#$^^*&(*))`;
	let hash = crypto.createHmac('sha512', salt).update(password).digest('base64');
	users.findOne({ _id: username }, function(err, user) {
		if (err) return res.status(500).end(err);
		if (user) return res.status(409).end('username ' + username + ' already exists');
		users.update({ _id: username }, { _id: username, password: hash }, { upsert: true }, function(err) {
			if (err) return res.status(500).end(err);
			req.session.username = username;
			return res.status(200).json(`user ${username} signed up`);
		});
	});
});

app.get('/api/user/', function(req, res) {
	return res.json({ user: req.username });
});

app.post('/api/signin/', function(req, res) {
	let username = req.body.username;
	let password = req.body.password;
	let salt = `#$^$&&^${username}#$^^*&(*))`;
	// retrieve user from the database
	if(!username || !password){
		res.send(400).end("Username/Password not provided");
	}
	users.findOne({ _id: username }, function(err, user) {
		if (err) return res.status(500).end(err);
		if (!user) return res.status(401).end('No such user exists');
		let comparePass = crypto.createHmac('sha512', salt).update(password).digest('base64');
		if (user.password !== comparePass) return res.status(401).end('Incorrect Username or password');
		req.session.username = username;
		return res.status(200).json(`user ${username} signed in`);
	});
});

app.get('/api/signout/', isAuthenticated, function(req, res) {
	req.session.destroy();
	res.redirect('/login.html');
});

app.get('/api/images/:id/', isAuthenticated, function(req, res) {
	const imageId = req.params.id;
	pictures.findOne({ _id: imageId }, function(error, image) {
		if (error || !image) return res.status(404).end('imageId ' + imageId + ' does not exists');
		else {
			let file = image.picture;
			console.log(file);
			res.setHeader('Content-Type', file.mimetype);
			res.sendFile(file.path);
		}
	});
});

app.get('/api/image/:id/info/', isAuthenticated, function(req, res) {
	const imageId = req.params.id;
	pictures.find({}, function(err, images) {
		if (err) return res.status(500).end(err);
		else if (images.length === 0) return res.status(204).json({_id:-1});
		else {
			let index;
			if (parseInt(imageId) === -1) {
				index = 0;
			} else {
				index = images.findIndex(function(image) {
					return image._id === imageId;
				});
			}
			if (index === -1) {
				return res.status(404).end("Image with given id doesn't exist");
			} else {
				let image = { ...images[index] };
				if (index === images.length - 1) {
					image.next = { _id: images[0]._id };
				} else {
					image.next = { _id: images[index + 1]._id };
				}
				if (index === 0) {
					image.previous = { _id: images[images.length - 1]._id };
				} else {
					image.previous = { _id: images[index - 1]._id };
				}
				return res.json(image);
			}
		}
	});
});

app.get('/api/imagesIsEmpty/', isAuthenticated, function(req, res) {
	pictures.count({}, function(err, count) {
		if (err) return res.status(500).end(err);
		else if (count === 0) return res.json({ empty: true });
		else return res.json({ empty: false });
	});
});


app.post('/api/images/', isAuthenticated, upload.single('picture'), function(req, res) {
	console.log(req.body, req.file);
	req.body.author = req.username;
	let image = new Picture(req.body, req.file);
	pictures.insert(image, function(err, insertedImage) {
		if (err) res.status(500).end('Image cannot be saved to database');
		else {
			pictures.find({},function(err,images){
				if(err) return res.status(500).end(err);
				let index = images.findIndex(function(image) {
					return image._id === insertedImage._id;
				});
				if (index === -1) {
					return res.status(500).end("Image Couldn't be inserted");
				} else {
					let image = { _id:insertedImage._id,title:insertedImage.title,author:insertedImage.author,date:insertedImage.date };
					if (index === images.length - 1) {
						image.next = { _id: images[0]._id };
					} else {
						image.next = { _id: images[index + 1]._id };
					}
					if (index === 0) {
						image.previous = { _id: images[images.length - 1]._id };
					} else {
						image.previous = { _id: images[index - 1]._id };
					}
					return res.status(200).json(image);
				}
			});
		
			
		}
	});
});

app.delete('/api/image/:id/', canDeleteImage, function(req, res) {
	const imageId = req.params.id;
	pictures.findOne({ _id: imageId }, function(error, image) {
		if (error) return res.status(404).end(`Image with id: ${imageId} doesn't exist`);
		else {
			if (image) {
				fs.unlinkSync(image.picture.path);
				pictures.remove({ _id: imageId }, function(err, n) {
					if (err || n !== 1) return res.status(500).end(`Image id ${imageId} can't be removed`);
					else if (n === 1) {
						comments.remove({ imageId: image._id }, function(err) {
							if (err)
								return res.status(500).end('Comments related to image cannot be deleted' + err.message);
							else return res.json({ deleted: true });
						});
						comments.persistence.compactDatafile();
					}
				});
				pictures.persistence.compactDatafile();
			} else {
				return res.status(500).end(`Image with id: ${imageId} cannot be deleted`);
			}
		}
	});
});

app.get('/api/image/:id/comments/:page/:size/', isAuthenticated, function(req, res) {
	let page = parseInt(req.params.page);
	let PAGE_SIZE = parseInt(req.params.size);
	let start = (page - 1) * PAGE_SIZE;
	let end = start + PAGE_SIZE;
	const imageId = req.params.id;

	comments.find({ imageId: imageId }).sort({ createdAt: -1 }).exec(function(err, items) {
		if (err) return res.status(500).end(err.message);
		else if (items) {
			let result = {};
			if (start > 0) {
				result.previous = page - 1;
			}
			if (end < items.length) {
				result.next = page + 1;
			}
			result.comments = items.slice(start, end).reverse();
			return res.json(result);
		}
	});
});

app.post('/api/image/:id/comments/', isAuthenticated, function(req, res) {
	req.body.author = req.username;
	let comment = new Comment(req.body);
	//messages.unshift(message);
	comments.insert(comment, function(err, comment) {
		if (err) res.status(500).end(err.message);
		else if (comment) return res.json(comment);
	});
});

app.delete('/api/image/comments/:id/', canDeleteComments, function(req, res) {
	const commentId = req.params.id;
	comments.findOne({ _id: commentId }, function(error, comment) {
		if (error) return res.status(404).end(`Comment with id: ${commentId} doesn't exist`);
		else {
			if (comment) {
				comments.remove({ _id: commentId }, function(err, n) {
					console.log(n);
					if (err) return res.status(500).end(`Comment id ${commentId} can't be removed`);
					else if (n === 1) return res.json(comment);
					else return res.status(500).end(`Comment with id: ${commentId} cannot be deleted`);
				});
				comments.persistence.compactDatafile();
			} else {
				return res.status(500).end(`Comment with id: ${commentId} cannot be deleted`);
			}
		}
	});
});

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function(err) {
	if (err) console.log(err);
	else console.log('HTTP server on http://localhost:%s', PORT);
});

const api = (function() {
	'use strict';
	let module = {};
	let imageListeners = [];
	let commentListeners = [];
	let userListeners = [];
	let errorListeners = [];
	let currentPage = 1;

	function sendFiles(method, url, data, callback) {
		let formdata = new FormData();
		Object.keys(data).forEach(function(key) {
			let value = data[key];
			formdata.append(key, value);
		});
		let xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (xhr.status !== 200) callback('[' + xhr.status + ']' + xhr.responseText, null);
			else callback(null, JSON.parse(xhr.responseText));
		};
		xhr.open(method, url, true);
		xhr.send(formdata);
	}

	function send(method, url, data, callback) {
		let xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (xhr.status !== 200) callback('[' + xhr.status + ']' + xhr.responseText, null);
			else callback(null, JSON.parse(xhr.responseText));
		};
		xhr.open(method, url, true);
		if (!data) xhr.send();
		else {
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(data));
		}
	}

	/*  ******* Data types *******
        image objects must have at least the following attributes:
            - (String) _id
            - (String) title
            - (String) author
            - (Date) date
    
        comment objects must have the following attributes
            - (String) _id
            - (String) imageId
            - (String) author
            - (String) content
            - (Date) date
    
    ****************************** */



	function notifyUserListeners(username){
        userListeners.forEach(function(listener){
            listener(username);
        });
    };

	module.signup = function(username, password) {
		send("POST",'/api/signup/',{username:username,password:password},function(err,res){
			if (err) return notifyErrorListeners(err);
			getUsername(notifyUserListeners);
		});
	};

	module.signin = function(username, password) {
		send("POST",'/api/signin/',{username:username,password:password},function(err,res){
			if (err) return notifyErrorListeners(err);
			getUsername(notifyUserListeners);
		});
	};

	// module.signout = function() {
	// 	send("GET",'/api/signout/',null,function(err,res){
	// 		if(err) notifyErrorListeners(err);
	// 		else notifyUserListeners(res);

	// 	});
	// };

	module.onUserUpdate = function(listener){
		userListeners.push(listener);
		getUsername(listener);
	};

	const getUsername = function(callback){
        send("GET","/api/user/",null,function(err,res){
			console.log(res.user);
            if(err) notifyErrorListeners(err);
            return  callback(res.user);
        })
        //return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    };
	

	/**
	 * Images
	 */
	// Adds an image
	module.addImage = function(title,file) {
		sendFiles('POST', '/api/images/', { title: title, picture: file }, function(err, res) {
			if (err) return notifyErrorListeners(err);
			notifyImageListeners(res);
		});
	};

	const getImage = function(imageId, callback) {
		send('GET', `/api/image/${imageId}/info/`, null, callback);
	};

	const changeImage = function(imageId) {
		getImage(imageId, function(err, res) {
			if (err) return notifyErrorListeners(err);
			else {
				notifyImageListeners(res);
				notifyCommentListeners(res._id);
			}
		});
	};

	module.isImagesEmpty = function(caller) {
		send('GET', '/api/imagesIsEmpty/', null, function(err, res) {
			if (err) return notifyErrorListeners(err);
			caller(res.empty);
		});
	};

	// delete an image from the gallery given its imageId
	module.deleteImage = function(imageId) {
		console.error(imageId);
		send('DELETE', `/api/image/${imageId}/`, null, function(err, res) {
			if (err) return notifyErrorListeners(err);
			else {
				 return notifyImageListeners(res);
			}
		});
	};

	module.getDefaultImage = function(listener) {
		send('GET', `/api/image/-1/info/`, null, function(err, res) {
			if (err) return notifyErrorListeners(err);
			else {
				listener(res);
			}
		});
	};

	module.getNextImage = function(imageId) {
		send('GET', `/api/image/${imageId}/next/`, null, function(err, nextImage) {
			if (err) return notifyErrorListeners(err);
			else if (nextImage._id !== imageId) return changeImage(nextImage._id);
		});
	};

	module.getPrevImage = function(imageId) {
		send('GET', `/api/image/${imageId}/prev/`, null, function(err, prevImage) {
			if (err) return notifyErrorListeners(err);
			else {
				if (prevImage._id !== imageId) {
					return changeImage(prevImage._id);
				}
			}
		});
	};

	const notifyImageListeners = function(image) {
		imageListeners.forEach(function(listener) {
			listener(image);
		});
	};

	// call handler when an image is added or deleted from the gallery
	module.onImageUpdate = function(handler) {
		imageListeners.push(handler);
	};

	/***
		 * 	
		 * Comments
		 * 
		 */

	// add a comment to an image

	module.addComment = function(imageId, content) {
		send(
			'POST',
			`/api/image/${imageId}/comments/`,
			{ imageId: imageId,  content: content },
			function(err, res) {
				if (err) return notifyErrorListeners(err);
				notifyCommentListeners(imageId);
			}
		);
	};

	// delete a comment to an image
	module.deleteComment = function(commentId) {
		send('DELETE', `/api/image/comments/${commentId}/`, null, function(err, res) {
			if (err) return notifyErrorListeners(err);
			notifyCommentListeners(res.imageId);
		});
	};

	const getComments = function(imageId, page,listener,size=5,) {
		currentPage = page;
		send('GET', `/api/image/${imageId}/comments/${page}/${size}/`, null, listener);
	};

	function notifyCommentListeners(imageId, page = 1) {
		getComments(imageId, page, function(err, comments) {
			if (err) return notifyErrorListeners(err);
			commentListeners.forEach(function(listener) {
				listener(comments, currentPage);
			});
		});
	}

	module.changePage = function(imageId, page) {
		notifyCommentListeners(imageId, page);
	};

	module.onCommentUpdate = function(imageId, listener) {
		commentListeners.push(listener);
		if (!imageId) {
			listener({ comments: [] });
		} else {
			getComments(imageId, currentPage, function(err, comments) {
				if (err) return notifyErrorListeners(err);
				else return listener(comments, currentPage);
			});
		}
	};

	module.commentsAreEmpty = function(callback) {
		send('GET', '/api/commentsAreEmpty', null, function(err, res) {
			if (err) return notifyErrorListeners(err);
			else return callback(res.empty);
		});
	};

	/**
	 * 
	 * Errors
	 */

	function notifyErrorListeners(err) {
		errorListeners.forEach(function(listener) {
			listener(err);
		});
	}

	module.onError = function(listener) {
		errorListeners.push(listener);
	};

	// (function refresh(){
	//     setTimeout(function(e){
	//         notifyMessageListeners();
	//         refresh();
	//     }, 2000);
	// }());

	return module;
})();

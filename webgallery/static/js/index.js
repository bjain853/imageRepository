(function() {
	'use strict';

	let IMAGE_ID;

	document.querySelector('#alert-close').addEventListener('click', function(event) {
		document.querySelector('#alert').style.visibility = 'hidden';
	});

	api.onGalleryUpdate(function(users){
		users.forEach(function(user){
			let element = document.createElement('div');
			element.id = user._id;
			element.innerHTML = `<li><button id=${user._id}-gallery-btn >${user._id}</button></li>`;
			document.querySelector('.galleries').append(element);
			document.querySelector(`#${user._id}-gallery-btn`).addEventListener('click',function(event){
				console.log(user._id);
				api.changeGallery(user._id,renderImage);
			});
			
		});
	});

	api.onUserUpdate(function(username) {
		//document.querySelector('#signin_button').style.visibility = username ? 'hidden' : 'visible';
		document.querySelector('#signout_button').style.visibility = username ? 'visible' : 'hidden';
		document.querySelector('#image-form-container').style.visibility = username ? 'visible' : 'hidden';
		document.querySelector('#comment-form-container').style.visibility = username ? 'visible' : 'hidden';
		document.querySelector('#hide-show-btn').style.visibility = username ? 'visible' : 'hidden';
		if (!username) {
			window.location.href = 'http://localhost:3000/login.html';
		}
	});

	api.onError(function(err) {
		console.error('[error]', err);
	});

	api.onError(function(err) {
		let error_box = document.querySelector('#alert-message');
		error_box.innerHTML = err;
		document.querySelector('#alert').style.visibility = 'visible';
	});

	const renderImage = function(image) {
		const element = document.querySelector('.image-carrousel');
		if (image) {
			element.style.visibility = 'visible';
			document.querySelector('#comments').style.visibility="visible";
			let date = new Date(image.date);
			IMAGE_ID = image._id;
			element.innerHTML = `
			<button class="scroll-btn left-btn"></button>
			<div class="image-card">
            <button class="image-delete-btn delete"></button>
            <div class="image-container">
              <img class="posted-image" alt="No Image Available" src="/api/images/${image._id}/" />
            </div>
            <div class="image-detail-container">
              <span class="image-title">
                ${image.title}
              </span>
              <span class="image-date">
			  ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}
              </span>
              <span class="image-author">
                ${image.author}
              </span>
            </div>  
			</div>
			<button class="scroll-btn right-btn"></button>
          `;

			element.querySelector('.image-delete-btn.delete').onclick = function(event) {
				api.deleteImage(image._id, function(deleted) {
					if (deleted) {
						api.changeImage(image.next._id);
					}
				});
			};

			element.querySelector('.scroll-btn.left-btn').onclick = function(event) {
				api.changeImage(image.previous._id);
			};
			element.querySelector('.scroll-btn.right-btn').onclick = function(event) {
				api.changeImage(image.next._id);
			};
		} else {
			element.style.visibility = 'hidden';
			document.querySelector('#comments').style.visibility="hidden";
		}
	};

	const renderComments = function(res, page = 1) {
		const { previous, next, comments } = res;
		document.querySelector('#comments-box').innerHTML = '';
		if (comments && comments.length !== 0) {
			document.querySelector('#comments').style.visibility = 'visible';
			comments.forEach(function(comment) {
				let elmt = document.createElement('div');
				elmt.className = 'comment';
				elmt.id = comment._id;
				let date = new Date(comment.date);
				elmt.innerHTML = `
                <div class="comment-user">
                <img class="comment-picture" src="media/man.svg" />
                <div class="comment-author">${comment.author}</div>
                <div class="comment-date"> ${date.getDate()}-${date.getMonth()}-${date.getFullYear()}</div> 
                </div>
                <div class="comment-content">
                ${comment.content}
                </div>
                <div class="comment-btns">
                <button class="comment-delete-btn delete"> </button>
                </div>`;

				elmt.querySelector('.comment-delete-btn.delete').addEventListener('click', function(event) {
					api.deleteComment(comment._id);
				});
				document.querySelector('#comments-box').prepend(elmt);
			});

			let Buttons = document.querySelector('.comment-btns-container');

			Buttons.querySelector('.comment-btn-right.comment-btn').onclick = function(event) {
				if (next) {
					api.changePage(IMAGE_ID, next);
				}
			};
			Buttons.querySelector('.comment-btn-left.comment-btn').onclick = function(event) {
				if (previous) {
					api.changePage(IMAGE_ID, previous);
				}
			};
			Buttons.querySelector('.page').innerHTML = `${page}`;
		} else {
			document.querySelector('#comments').style.visibility = 'hidden';
		}
	};

	api.onImageUpdate((image) => {
		renderImage(image);
		api.onCommentUpdate(image._id, function(comments, page) {
			renderComments(comments, page);
		});
	});

	window.addEventListener('load', function() {
		/**********************************************/

		document.querySelector('#alert').style.visibility = 'hidden';

		api.isImagesEmpty(function(empty) {
			if (empty) {
				document.querySelector('.image-carrousel').style.visibility = 'hidden';
				document.querySelector('#comments').style.visibility = 'hidden';
			} else {
				document.querySelector('.image-carrousel').style.visibility = 'visible';
				document.querySelector('#comments').style.visibility = 'visible';
				api.getDefaultImage((image) => {
					renderImage(image);
					api.onCommentUpdate(image._id, function(comments, page) {
						renderComments(comments, page);
					});
				});
			}
		});

		document.getElementById('image-form').addEventListener('submit', function(event) {
			event.preventDefault();
			// read form elements
			let title = document.getElementById('image-title').value;
			let picture = document.querySelector('#upload-picture').files[0];
			// clean form
			api.addImage(title, picture);
			document.querySelector('#image-form').reset();
		});

		document.querySelector('#comment-form').addEventListener('submit', function(event) {
			event.preventDefault();
			api.isImagesEmpty(function(empty) {
				if (empty) {
					alert('Cannot add comment');
				} else {
					let content = document.getElementById('comment-content').value;
					// clean form
					api.addComment(IMAGE_ID, content);
					document.getElementById('comment-form').reset();
				}
			});
		});

		document.getElementById('hide-show-btn').addEventListener('click', function() {
			let element = document.getElementById('image-form-container');
			const visibility = element.style.visibility;
			element.style.visibility = visibility === 'hidden' ? 'visible' : 'hidden';
		});
		/******Image and Comment Renderer**************/
	});
})();

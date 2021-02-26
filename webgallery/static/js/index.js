(function() {
	'use strict';

	let IMAGE_ID;

	document.querySelector('#alert-close').addEventListener('click', function(event) {
		document.querySelector('#alert').style.visibility = 'hidden';
	});



	api.onUserUpdate(function(username){
		console.log(username);
		document.querySelector("#signin_button").style.visibility = (username)? 'hidden' : 'visible';
		document.querySelector("#signout_button").style.visibility = (username)? 'visible' : 'hidden';
		document.querySelector('#image-form-container').style.visibility = (username)? 'visible' : 'hidden';
		document.querySelector('#comment-form-container').style.visibility = (username)? 'visible' : 'hidden';
		document.querySelector('#hide-show-btn').style.visibility = (username)? 'visible' : 'hidden';
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
			element.style.display = 'flex';
			element.id = image._id;
			IMAGE_ID = image._id;
			let title = element.querySelector('.image-title');
			let author = element.querySelector('.image-author');
			let imageElem = element.querySelector('.posted-image');
			let dateElem = element.querySelector('.image-date');
			let date = new Date(image.date);
			title.innerHTML = image.title;
			author.innerHTML = image.author;
			imageElem.src = `/api/images/${image._id}/`;
			imageElem.alt = image.title;
			dateElem.innerHTML = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

			element.querySelector('.image-delete-btn.delete').onclick = function(event) {
				api.deleteImage(image._id);
			};

			element.querySelector('.scroll-btn.left-btn').onclick = function(event) {
                
				api.getPrevImage(image._id);
			};
			element.querySelector('.scroll-btn.right-btn').onclick = function(event) {
				api.getNextImage(image._id);
			};
		}
	};

	const renderComments = function(res, page=1) {
		const { previous, next ,comments} = res;
		document.querySelector('#comments-box').innerHTML = '';
		if(comments){
            comments.forEach(function(comment) {
                let elmt = document.createElement('div');
                elmt.className = 'comment';
                elmt.id = comment._id;
                let date = new Date(comment.date);
                elmt.innerHTML = 
				`
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
        }
	};

	api.onImageUpdate(function(image) {
        api.isImagesEmpty(function(empty){
            if(empty){
                document.querySelector('.image-carrousel').style.visibility = 'hidden';
                document.querySelector('#comments').style.visibility = 'hidden';
            }else{
                document.querySelector('.image-carrousel').style.visibility = 'visible';
                document.querySelector('#comments').style.visibility = 'visible';
                renderImage(image);
                api.onCommentUpdate(image._id, function(comments,page) {
                    renderComments(comments,page);
                });   
            }
        })
	});

	

	window.addEventListener('load', function() {
		/**********************************************/
	

		document.querySelector('#alert').style.visibility="hidden";

		api.isImagesEmpty(function(empty) {
			const element = document.querySelector('.image-carrousel');
			if (empty) {
				element.style.visibility = 'hidden';
				document.querySelector('.image-carrousel').style.visibility = 'hidden';
                document.querySelector('#comments').style.visibility = 'hidden';
			} else {
				element.style.visibility = 'visible';
				document.querySelector('.image-carrousel').style.visibility = 'visible';
                document.querySelector('#comments').style.visibility = 'visible';
				api.getDefaultImage(function(image) {
					renderImage(image);
					api.onCommentUpdate(image._id, function(comments,currentPage) {
                       
						if (comments.comments.length !== 0) {
							renderComments(comments, currentPage);
						}
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

			// create a new message element
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
			//https://www.w3schools.com/howto/howto_js_toggle_hide_show.asp
			let element = document.getElementById('image-form-container');
			if (element.style.display === 'none') {
				element.style.display = 'flex';
			} else {
				element.style.display = 'none';
			}
		});
		/******Image and Comment Renderer**************/
	});
})();

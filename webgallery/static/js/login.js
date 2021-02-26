(function(){
    "use strict";
    
    window.addEventListener('load', function(){
        document.querySelector('#alert-close').addEventListener('click', function(event) {
            document.querySelector('#alert').style.visibility = 'hidden';
        });
        document.querySelector('#alert').style.visibility='hidden';
        api.onError(function(err){
            console.error("[error]", err);
        });
    
        api.onError(function(err){
            let error_box = document.querySelector('#alert-message');
            error_box.innerHTML = err;
            document.querySelector('#alert').style.visibility = 'visible';
        });
        
        api.onUserUpdate(function(username){
            console.log(username);
            if (username) window.location.href = 'http://localhost:3000/';
        });
        
        function submit(){
            console.log(document.querySelector("form").checkValidity());
            if (document.querySelector("form").checkValidity()){
                let username = document.querySelector("form [name=username]").value;
                let password =document.querySelector("form [name=password]").value;
                let action =document.querySelector("form [name=action]").value;
                api[action](username, password, function(err){
                    if (err) document.querySelector('#alert-message').innerHTML = err;

                });
            }
        }

        document.querySelector('#signin').addEventListener('click', function(e){
            document.querySelector("form [name=action]").value = 'signin';
            submit();
        });

        document.querySelector('#signup').addEventListener('click', function(e){
            document.querySelector("form [name=action]").value = 'signup';
            submit();
        });

        document.querySelector('form').addEventListener('submit', function(e){
            e.preventDefault();
        });
    });
}())



const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");
const showPasswordSpan = document.querySelector("#showPassword");
const showConfirmPasswordSpan = document.querySelector("#showConfirmPassword");

const showPassword = function(){

    if(passwordInput.type=="password"&&confirmPasswordInput.type=="password"){
        passwordInput.type = "text";
        confirmPasswordInput.type = "text";
    }
    else{
        passwordInput.type = "password";
        confirmPasswordInput.type = "password";
    };
};

showPasswordSpan.addEventListener("click",showPassword);
showConfirmPasswordSpan.addEventListener("click",showPassword);
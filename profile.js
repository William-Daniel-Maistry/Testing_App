// profile.js

const form = document.querySelector("form")

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem("signUp", "true");
    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();

    localStorage.setItem("firstname", firstname)
    localStorage.setItem("lastname", lastname)
    window.location.href = "index.html"
  })
}




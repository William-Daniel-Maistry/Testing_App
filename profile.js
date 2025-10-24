// profile.js


  // Initialize Supabase client
  const supabaseUrl = 'https://yohbyoeuukvadrpgaxus.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaGJ5b2V1dWt2YWRycGdheHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjkzNzksImV4cCI6MjA3Njc0NTM3OX0.W8x5lP1zaB6Us80h7poH1neJmSDtPY8PvtQj2MMuvNg';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);



const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const showSignUp = document.getElementById("showSignUp");
const showSignIn = document.getElementById("showSignIn");



signUpForm.style.display = "none";


showSignUp.addEventListener("click", () => {
  signInForm.style.display = "none";
  signUpForm.style.display = "flex";
})

showSignIn.addEventListener("click", () => {
  signUpForm.style.display = "none";
  signInForm.style.display = "flex";
})




// Password Validation Function
function isValidPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  return regex.test(password);
}

// Sign-Up Handler
signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstname = document.getElementById("firstname").value.trim();
  const lastname = document.getElementById("lastname").value.trim();
  const emailSignUp = document.getElementById("signUpEmail").value.trim();
  const passwordSignUp = document.getElementById("signUpPassword").value;

  if (!isValidPassword(passwordSignUp)) {
    alert(
      "Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character."
    );
    return;
  }


    // --- START: Silent email check ---
  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: emailSignUp,
      password: "dummyPassword123!",
    });

    if (!error) {
      // Somehow signed in with dummy password? User exists
      alert("You already have an account. Please log in instead.");
      return;
    }

    if (error.message.includes("Invalid login credentials")) {
      // Email exists, wrong password
      alert("You already have an account. Please log in instead.");
      return;
    }

    // If error.message says "User not found", we can safely continue
  } catch (err) {
    console.error("Error checking email:", err);
    // Optionally allow sign-up to continue anyway
  }
  // --- END: Silent email check ---


  try {
    const { error } = await supabaseClient.auth.signUp({
      email: emailSignUp,
      password: passwordSignUp,
      options: {
        data: { firstname, lastname }
      }
    });

  if (error) {
    if (error.message.includes("User already registered")) {
      alert("You already have an account. Please log in instead.");
    } else {
      alert("Sign up failed: " + error.message);
    }
    return;
  }

    alert("Sign-up successful! Please check your email for confirmation.");
    signUpForm.reset();
    signUpForm.style.display = "none";
    signInForm.style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Sign-up failed. Check console for details.")
  }
});


// Sign-In Handler
signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailSignIn = document.getElementById("signInEmail").value.trim();
  const passwordSignIn = document.getElementById("signInPassword").value;

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: emailSignIn,
      password: passwordSignIn,
    });

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    alert(`Sign-in successful! Welcome back.`);
    window.location.href = "index.html"
  } catch (err) {
    console.error(err);
    alert("Sign-in failed. Check console for details.")
  }
})




const resetBtn = document.getElementById("resetBtn");

resetBtn?.addEventListener("click", async () => {
  const email = document.getElementById("resetEmail").value.trim();
  if (!email) return alert("Please enter your email.");

  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://william-daniel-maistry.github.io/Testing_App/reset.html' // <-- page where user sets new password
  });

  if (error) {
    console.error("Error sending password reset:", error.message);
    alert("Error sending reset email: " + error.message);
  } else {
    alert("Password reset email sent! Check your inbox.");
  }
});

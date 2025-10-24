const supabaseUrl = 'https://yohbyoeuukvadrpgaxus.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

document.getElementById("updatePasswordBtn").addEventListener("click", async () => {
  const newPassword = document.getElementById("newPassword").value.trim();
  if (!newPassword) return alert("Enter a new password.");

  const { data, error } = await supabaseClient.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error("Password update failed:", error.message);
    alert("Error updating password: " + error.message);
  } else {
    alert("Password updated successfully! You can now log in.");
    window.location.href = "profile.html"; // back to login
  }
});



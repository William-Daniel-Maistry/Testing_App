// import { createClient } from '@supabase/supabase-js'

  const supabaseUrl = 'https://yohbyoeuukvadrpgaxus.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaGJ5b2V1dWt2YWRycGdheHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjkzNzksImV4cCI6MjA3Njc0NTM3OX0.W8x5lP1zaB6Us80h7poH1neJmSDtPY8PvtQj2MMuvNg';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

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

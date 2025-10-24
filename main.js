
// main.js















  // Initialize Supabase client
  const supabaseUrl = 'https://yohbyoeuukvadrpgaxus.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaGJ5b2V1dWt2YWRycGdheHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjkzNzksImV4cCI6MjA3Njc0NTM3OX0.W8x5lP1zaB6Us80h7poH1neJmSDtPY8PvtQj2MMuvNg';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let currentUserID;
let currentUser; // <-- make user accessible globally

(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "profile.html";
    return;
  }
  
  // else {
    currentUserID = session.user.id;
  //   await loadMessages();
  // }

  const response = await supabaseClient.auth.getUser();
  if (response.error) {
    console.error("Error fetching user:", response.error);
  }
  
  currentUser = response.data?.user;

  // if (!currentUser) {
    // alert("You must be signed in to send messages.");
    // return;
  // }


  await loadMessages();

 
})();


  const messagesDiv = document.getElementById('messages');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  




  // Load existing messages on page load
  async function loadMessages() {
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .order('inserted_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error(error);
      return;
    }
    messagesDiv.innerHTML = '';
    data.forEach(msg => {
      addMessageToDOM(msg);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Add message element to chat box
  function addMessageToDOM(msg) {
    const div = document.createElement('div');
    const firstname = msg.firstname;
    const lastname = msg.lastname;
    const time = new Date(msg.inserted_at).toLocaleTimeString();

    const deleteButtonHTML = msg.user_id === currentUserID
      ? `<button class="deleteBtn" data-id=${msg.id}>Delete</button>`
      : '';

    div.innerHTML = `<div id="message-container">
                    <p id="names"><strong>${firstname} ${lastname}</strong></p><p id="time">${time}
                    ${deleteButtonHTML}
                    </p>
                    <p id="final-message">${msg.message}</p>
                    <div class="reactions">
                      <button class="likeBtn" data-id="${msg.id}">👍 <span class="likeCount">${msg.likes || 0}</span></button>
                      <button class="dislikeBtn" data-id="${msg.id}">👎 <span class="dislikeCount">${msg.dislikes || 0}</span></button>
                    </div>
                    </div>`
    // div.innerHTML = `[${time}] ${firstname} ${lastname}: ${msg.message}`;
    messagesDiv.appendChild(div);

    const deleteBtn = div.querySelector(".deleteBtn");

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        const id = deleteBtn.getAttribute("data-id");

        const { error } = await supabaseClient
          .from("messages")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Delete failed:", error);
        } else {
          div.remove();
        }
      })
    }


    const likeBtn = div.querySelector(".likeBtn");
    const dislikeBtn = div.querySelector(".dislikeBtn");

    if (likeBtn && dislikeBtn) {
      likeBtn.addEventListener("click", () => handleReaction(msg.id, "like", likeBtn, dislikeBtn));
      dislikeBtn.addEventListener("click", () => handleReaction(msg.id, "dislike", dislikeBtn, likeBtn));
    }

  }

//   const response = await supabaseClient.auth.getUser();
//   if (response.error) {
//     console.error("Error fetching user:", response.error);
//     return;
//   }

// const user = response.data.user;

//   if (!user) {
//     alert("You must be signed in to send messages.")
//     return;
//   }



  // Send a new message to Supabase
  async function sendMessage() {
  // const username = usernameInput.value.trim() || 'Anonymous';
  const message = messageInput.value.trim();
  if (!message) return;

  // Insert message in DB
    if (!currentUser) {
    alert("You must be signed in to send messages.")
    return;
  }

  const firstname = currentUser.user_metadata.firstname;
  const lastname = currentUser.user_metadata.lastname;

  const { data, error } = await supabaseClient.from('messages').insert([{ user_id: currentUser.id, firstname, lastname, message }]).select();

  if (error) {
    console.error(error);
    return;
  }

  // Clear input
  messageInput.value = '';

  // Immediately add new message to DOM (data[0] is the inserted row)
  if (data && data.length > 0) {
    addMessageToDOM(data[0]);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}



async function handleReaction(messageId, type, button, oppositeButton) {
  if (!currentUser) return alert("You must be signed in to react.");

  try {
    // 1️⃣ Check if user has already reacted
    const { data: existing } = await supabaseClient
      .from("message_reactions")
      .select("*")
      .eq("message_id", messageId)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (!existing) {
      // 2️⃣ Insert new reaction
      await supabaseClient.from("message_reactions").insert([{ 
        message_id: messageId, 
        user_id: currentUser.id, 
        type 
      }]);
    } else if (existing.type === type) {
      // 3️⃣ Remove reaction if same button clicked again (toggle off)
      await supabaseClient.from("message_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      // 4️⃣ Switch from like → dislike or vice versa
      await supabaseClient.from("message_reactions")
        .update({ type })
        .eq("id", existing.id);
    }

    // 5️⃣ Refresh counts after each action
    await updateReactionCounts(messageId);

  } catch (err) {
    console.error("Reaction failed:", err);
  }
}




  




  async function updateReactionCounts(messageId) {
  const { data: reactions } = await supabaseClient
    .from("message_reactions")
    .select("type")
    .eq("message_id", messageId);

  const likes = reactions.filter(r => r.type === "like").length;
  const dislikes = reactions.filter(r => r.type === "dislike").length;

  // Update counts in the DOM
  const messageDiv = document.querySelector(`[data-id="${messageId}"]`)?.closest("#message-container");
  if (messageDiv) {
    const likeCount = messageDiv.querySelector(".likeCount");
    const dislikeCount = messageDiv.querySelector(".dislikeCount");
    if (likeCount) likeCount.textContent = likes;
    if (dislikeCount) dislikeCount.textContent = dislikes;
  }

  // Optionally, update `messages` table totals
  await supabaseClient
    .from("messages")
    .update({ likes, dislikes })
    .eq("id", messageId);
}















  // Subscribe to realtime updates
  supabaseClient.channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      addMessageToDOM(payload.new);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    })
    .subscribe();

  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // loadMessages();




  supabaseClient.channel('public:message_reactions')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, async (payload) => {
    await updateReactionCounts(payload.new?.message_id || payload.old?.message_id);
  })
  .subscribe();





// Handle Sign Out

signOutBtn.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Error signing out:", error.message);
    alert("Error signing out. Please try again.")
  } else {
    alert("Signed out successfully!");
    window.location.href = "profile.html"
  }
})
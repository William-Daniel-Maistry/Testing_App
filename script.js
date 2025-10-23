
  // Initialize Supabase client
  const supabaseUrl = 'https://yohbyoeuukvadrpgaxus.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaGJ5b2V1dWt2YWRycGdheHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjkzNzksImV4cCI6MjA3Njc0NTM3OX0.W8x5lP1zaB6Us80h7poH1neJmSDtPY8PvtQj2MMuvNg';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  const messagesDiv = document.getElementById('messages');
  // const usernameInput = document.getElementById('username');
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
    const name = msg.username || 'Anonymous';
    const time = new Date(msg.inserted_at).toLocaleTimeString();
    div.textContent = `[${time}] ${name}: ${msg.message}`;
    messagesDiv.appendChild(div);
  }

  // Send a new message to Supabase
  async function sendMessage() {
  // const username = usernameInput.value.trim() || 'Anonymous';
  const message = messageInput.value.trim();
  if (!message) return;

  // Insert message in DB
  const { data, error } = await supabaseClient.from('messages').insert([{ username, message }]).select();

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

  loadMessages();

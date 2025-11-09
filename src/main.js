import './style.css'
import { fetchAdminMessage, createPeer, fetchClientList } from './apiFetcher.js'


let peer = null; // Make peer object globally accessible, initially null
const connectedPeers = new Set(); // To keep track of active data connections

function displayMessage(senderId, message) {
  const messageDisplay = document.getElementById('message-display');
  if (messageDisplay) {
    messageDisplay.textContent = `[${senderId}]: ${message}`;
  } else {
    console.error('Message display area not found.');
  }
}

function setupDataConnectionListeners(conn, isInitiator) {
  conn.on('open', () => {
    console.log(`Data connection opened with ${conn.peer}`);
    if (isInitiator) {
      startSendingMessages(conn);
    }
  });

  conn.on('data', (data) => {
    console.log(`Received data from ${conn.peer}:`, data);
    displayMessage(conn.peer, data);
  });

  conn.on('close', () => {
    console.log(`Data connection closed with ${conn.peer}`);
    connectedPeers.delete(conn.peer);
    stopSendingMessages(conn.peer); // Stop sending messages when connection closes
  });

  conn.on('error', (err) => {
    console.error(`Data connection error with ${conn.peer}:`, err);
  });
}

const messageIntervals = {}; // To store intervals for each peer

function sendMessage(conn) {
  const randomNumber = Math.floor(Math.random() * 1000);
  const message = `Hello from client ID ${peer.id} - Random: ${randomNumber}`;
  try {
    conn.send(message);
    displayMessage(peer.id, message);
  } catch (error) {
    // Gracefully handle disconnections without logging the error
    if (error.message.includes('Connection is not open')) {
      console.warn(`Attempted to send message to disconnected peer ${conn.peer}`);
    } else {
      console.error(`Error sending message to ${conn.peer}:`, error);
    }
  }
}

function startSendingMessages(conn) {
  if (messageIntervals[conn.peer]) {
    clearInterval(messageIntervals[conn.peer]);
  }
  messageIntervals[conn.peer] = setInterval(() => sendMessage(conn), 5);
}

function stopSendingMessages(peerId) {
  if (messageIntervals[peerId]) {
    clearInterval(messageIntervals[peerId]);
    delete messageIntervals[peerId];
  }
}

async function setupPeerAndConnect() {
  if (peer) {
    peer.destroy(); // Destroy existing peer connection if any
    peer = null;
  }

  peer = await createPeer();
  const peerInfoDiv = document.getElementById('peer-info');
  if (peerInfoDiv) {
    peer.on('open', (id) => {
      peerInfoDiv.innerHTML = `My peer ID is: ${id} <button id="generate-peer-id-button">Generate Peer ID</button>`;
      document.getElementById('generate-peer-id-button').addEventListener('click', setupPeerAndConnect);
    });

    peer.on('connection', (conn) => {
      console.log(`Incoming data connection from ${conn.peer}`);
      connectedPeers.add(conn.peer);
      setupDataConnectionListeners(conn, false); // Not the initiator
    });

    peer.on('disconnected', () => {
      console.log('Peer disconnected from server.');
      resetClientState();
    });

    peer.on('close', () => {
      console.log('Peer connection closed.');
      resetClientState();
    });

  } else {
    console.error('Peer info display area not found.');
  }
}

function resetClientState() {
  peer = null;
  connectedPeers.clear();
  for (const peerId in messageIntervals) {
    stopSendingMessages(peerId);
  }
  const peerInfoDiv = document.getElementById('peer-info');
  if (peerInfoDiv) {
    peerInfoDiv.innerHTML = `<button id="generate-peer-id-button">Generate Peer ID</button>`;
    document.getElementById('generate-peer-id-button').addEventListener('click', setupPeerAndConnect);
  }
  const clientListDiv = document.getElementById('client-list');
  if (clientListDiv) {
    clientListDiv.innerHTML = '<h2>Connected Clients:</h2><p>No clients connected.</p>';
  }
  const messageDisplay = document.getElementById('message-display');
  if (messageDisplay) {
    messageDisplay.textContent = 'No messages yet.';
  }
}


async function displayClientList() {
  const clientListDiv = document.getElementById('client-list');
  if (clientListDiv) {
    // Only fetch client list if peer is active
    if (peer && peer.id) {
      const clients = await fetchClientList();
      clientListDiv.innerHTML = '<h2>Connected Clients:</h2>';
      if (clients.length > 0) {
        const ul = document.createElement('ul');
        clients.forEach(client => {
          const li = document.createElement('li');
          li.textContent = client;
          ul.appendChild(li);

          // Connect to new peers
          if (peer && peer.id !== client && !connectedPeers.has(client)) {
            console.log(`Attempting to connect to new peer: ${client}`);
            const conn = peer.connect(client);
            connectedPeers.add(client);
            setupDataConnectionListeners(conn, true); // Is the initiator
          }
        });
        clientListDiv.appendChild(ul);
      } else {
        clientListDiv.innerHTML += '<p>No clients connected.</p>';
        // If no clients are connected, stop all message sending intervals and reset state
        resetClientState();
      }
    } else {
      clientListDiv.innerHTML = '<h2>Connected Clients:</h2><p>Generate Peer ID to see clients.</p>';
    }
  } else {
    console.error('Client list display area not found.');
  }
}

// Initial setup for the button
document.addEventListener('DOMContentLoaded', () => {
  const generateButton = document.getElementById('generate-peer-id-button');
  if (generateButton) {
    generateButton.addEventListener('click', setupPeerAndConnect);
  }
  // Initial display of client list (will show "Generate Peer ID to see clients.")
  displayClientList();
});


// Update every 5 seconds
setInterval(displayClientList, 100);

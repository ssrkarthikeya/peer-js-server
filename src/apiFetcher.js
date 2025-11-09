import { Peer } from 'peerjs';

export async function fetchAdminMessage() {
  try {
    const response = await fetch('http://localhost:3000/admin');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error fetching admin message:', error);
    return 'Failed to fetch message from server.';
  }
}

export async function createPeer(id) {
  return new Peer(id, {
    host: 'localhost',
    port: 3000,
    path: '/peerjs'
  });
}

export async function fetchClientList() {
  try {
    const response = await fetch('http://localhost:3000/clients');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching client list:', error);
    return [];
  }
}

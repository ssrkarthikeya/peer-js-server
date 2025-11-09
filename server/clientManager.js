const connectedClients = new Map(); // Use a Map to store client objects by ID

export const addClient = (client) => {
  connectedClients.set(client.getId(), client);
  console.log(`Client ${client.getId()} connected. Total clients: ${connectedClients.size}`);
};

export const removeClient = (clientId) => {
  connectedClients.delete(clientId);
  console.log(`Client ${clientId} disconnected. Total clients: ${connectedClients.size}`);
};

export const getConnectedClients = () => {
  return Array.from(connectedClients.keys()); // Return only IDs for the client list
};

export const clearAllClients = () => {
  connectedClients.forEach(client => {
    if (client.socket && client.socket.readyState === 'open') {
      client.socket.close(); // Explicitly close the underlying socket connection
    }
  });
  connectedClients.clear();
  console.log('All clients have been kicked and connections closed.');
};

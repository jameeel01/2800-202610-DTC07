const express = require('express');
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// Basic Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API server!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.post('/api/test', (req, res) => {
  const { data } = req.body;
  res.json({ received: data, message: 'Data received successfully' });
});

app.get('/api/users', (req, res) => {
  res.json({ users: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }] });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`  Try: http://localhost:${PORT}/api/health`);
});

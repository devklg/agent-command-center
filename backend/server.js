const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Agent Management System
const AgentCoordinator = require('./services/agent-coordinator');
const agentCoordinator = new AgentCoordinator(io);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/agents', require('./routes/agents'));
app.use('/api/commands', require('./routes/commands'));
app.use('/api/status', require('./routes/status'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agents: agentCoordinator.getAllAgentStatus()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Send current agent status
  socket.emit('agent-status', agentCoordinator.getAllAgentStatus());
  
  // Handle agent commands
  socket.on('agent-command', (data) => {
    agentCoordinator.executeCommand(data);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`🚀 Agent Command Center Backend running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  
  // Initialize agent coordinator
  agentCoordinator.initialize();
});

module.exports = { app, server, io };
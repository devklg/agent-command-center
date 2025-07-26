const express = require('express');
const router = express.Router();

// Get all agents status
router.get('/status', (req, res) => {
  const agentCoordinator = req.app.get('agentCoordinator');
  res.json(agentCoordinator.getAllAgentStatus());
});

// Start all agents
router.post('/start-all', (req, res) => {
  const agentCoordinator = req.app.get('agentCoordinator');
  
  Object.keys(agentCoordinator.agents).forEach(agentId => {
    agentCoordinator.executeCommand({
      command: 'start',
      agentId: agentId
    });
  });
  
  res.json({ message: 'All agents started', status: agentCoordinator.getAllAgentStatus() });
});

// Control specific agent
router.post('/:agentId/:command', (req, res) => {
  const { agentId, command } = req.params;
  const payload = req.body;
  
  const agentCoordinator = req.app.get('agentCoordinator');
  agentCoordinator.executeCommand({ command, agentId, payload });
  
  res.json({ message: `Agent ${agentId} ${command} executed`, status: agentCoordinator.getAllAgentStatus() });
});

module.exports = router;
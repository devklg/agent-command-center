class AgentCoordinator {
  constructor(io) {
    this.io = io;
    this.agents = {
      // 5 Command Center Agents
      'theo': { name: 'THEO', role: 'Frontend Specialist', port: 5001, status: 'ready', progress: 0, branch: 'theo-frontend' },
      'marcus': { name: 'MARCUS', role: 'Backend Specialist', port: 5002, status: 'active', progress: 10, branch: 'marcus-backend' },
      'alex': { name: 'ALEX', role: 'Real-time Specialist', port: 5003, status: 'ready', progress: 0, branch: 'alex-realtime' },
      'quinn': { name: 'QUINN', role: 'QA Specialist', port: 5004, status: 'ready', progress: 0, branch: 'quinn-qa' },
      'github': { name: 'GitHub Actions', role: 'DevOps Specialist', port: 5005, status: 'active', progress: 5, branch: 'github-actions' }
    };
    
    this.tasks = new Map();
    this.isInitialized = false;
  }

  initialize() {
    console.log('🤖 Initializing Agent Coordinator...');
    this.isInitialized = true;
    
    // Start progress simulation for active agents
    setInterval(() => {
      this.updateAgentProgress();
    }, 2000);
  }

  getAllAgentStatus() {
    return {
      agents: this.agents,
      totalProgress: this.calculateTotalProgress(),
      activeCount: Object.values(this.agents).filter(a => a.status === 'active').length,
      completedCount: Object.values(this.agents).filter(a => a.status === 'completed').length
    };
  }

  updateAgentProgress() {
    Object.keys(this.agents).forEach(agentId => {
      const agent = this.agents[agentId];
      if (agent.status === 'active' && agent.progress < 100) {
        agent.progress = Math.min(agent.progress + Math.random() * 10, 100);
        if (agent.progress >= 100) {
          agent.status = 'completed';
        }
      }
    });
    
    // Broadcast updated status
    this.io.emit('agent-status-update', this.getAllAgentStatus());
  }

  calculateTotalProgress() {
    const totalProgress = Object.values(this.agents).reduce((sum, agent) => sum + agent.progress, 0);
    return Math.round(totalProgress / Object.keys(this.agents).length);
  }

  executeCommand(data) {
    const { command, agentId, payload } = data;
    
    if (!this.agents[agentId]) {
      console.error(`Unknown agent: ${agentId}`);
      return;
    }
    
    switch (command) {
      case 'start':
        this.agents[agentId].status = 'active';
        break;
      case 'pause':
        this.agents[agentId].status = 'paused';
        break;
      case 'stop':
        this.agents[agentId].status = 'stopped';
        this.agents[agentId].progress = 0;
        break;
      case 'assign-task':
        this.assignTask(agentId, payload);
        break;
    }
    
    // Broadcast updated status
    this.io.emit('agent-status-update', this.getAllAgentStatus());
  }

  assignTask(agentId, task) {
    if (!this.tasks.has(agentId)) {
      this.tasks.set(agentId, []);
    }
    
    this.tasks.get(agentId).push({
      id: require('uuid').v4(),
      ...task,
      assignedAt: new Date(),
      status: 'assigned'
    });
    
    // Activate agent if not already active
    if (this.agents[agentId].status === 'ready') {
      this.agents[agentId].status = 'active';
    }
  }
}

module.exports = AgentCoordinator;
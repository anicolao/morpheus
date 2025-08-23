---
layout: default
title: Home
---

<div class="hero">
  <img src="{{ "/assets/images/logo.png" | relative_url }}" alt="Morpheum Logo" class="hero-logo">
  <h1>Morpheum</h1>
  <p>A collaborative environment where AI agents and humans work together seamlessly on software development projects</p>
</div>

<div class="content-section">
  <h2>Vision</h2>
  <p>Morpheum is building the future of collaborative software development. We envision a decentralized ecosystem where humans and AI agents can work together seamlessly, leveraging the strengths of both to create amazing tools, websites, and applications.</p>
  
  <div class="features">
    <div class="feature-card">
      <h3>🤝 Shared Context</h3>
      <p>Morpheum provides a shared understanding of the project for both humans and AI agents, including the codebase, project goals, and current status.</p>
    </div>
    
    <div class="feature-card">
      <h3>🧩 Task Decomposition</h3>
      <p>Complex development tasks can be broken down into smaller, manageable units that can be assigned to either AI agents or human developers.</p>
    </div>
    
    <div class="feature-card">
      <h3>🤖 AI-Assisted Development</h3>
      <p>Morpheum integrates with powerful AI coding agents to automate repetitive tasks, generate code, and provide intelligent suggestions.</p>
    </div>
    
    <div class="feature-card">
      <h3>👨‍💻 Human-in-the-Loop</h3>
      <p>Human developers are always in control. They can review, modify, and approve the work of AI agents, ensuring quality and integrity.</p>
    </div>
  </div>
</div>

<div class="content-section">
  <h2>Architecture</h2>
  <p>The Morpheum architecture is built on two core components that work together to provide a seamless development experience for both humans and AI agents.</p>
  
  <div class="features">
    <div class="feature-card">
      <h3>Matrix Network</h3>
      <p>The Matrix network serves as the decentralized communication protocol for all project-related discussions, status updates, and collaboration between humans and AI agents.</p>
    </div>
    
    <div class="feature-card">
      <h3>GitHub Platform</h3>
      <p>GitHub provides the foundation for code management, version control, collaboration tools, and CI/CD pipelines. All project artifacts are stored and served by GitHub.</p>
    </div>
  </div>
</div>

<div class="content-section">
  <h2>Current Status</h2>
  <p>Morpheum is currently in <strong>Phase v0.2 (Agent Advancement)</strong>, focusing on improving agent intelligence and reliability.</p>
  
  <div class="features">
    <div class="feature-card">
      <h3>✅ Completed</h3>
      <p><span class="status-badge status-completed">v0.1</span> Matrix bot with SWE-Agent capabilities</p>
      <p><span class="status-badge status-completed">Core</span> Basic AI agent infrastructure</p>
    </div>
    
    <div class="feature-card">
      <h3>🚀 In Progress</h3>
      <p><span class="status-badge status-active">v0.2</span> Enhanced agent intelligence</p>
      <p><span class="status-badge status-active">Core</span> Improved reliability and error handling</p>
    </div>
    
    <div class="feature-card">
      <h3>📋 Planned</h3>
      <p><span class="status-badge status-planned">v0.3</span> Advanced GitHub integration</p>
      <p><span class="status-badge status-planned">Future</span> Decentralized agent marketplace</p>
    </div>
  </div>
</div>

<div class="content-section">
  <h2>Get Started</h2>
  <p>Ready to explore Morpheum? Here's how to get involved with the project:</p>
  
  <div style="margin: 2rem 0;">
    <a href="{{ "/documentation/getting-started/" | relative_url }}" class="cta-button">Get Started</a>
    <a href="https://github.com/{{ site.github_username }}/{{ site.repository | split: '/' | last }}" class="cta-button cta-button-secondary" target="_blank" rel="noopener">View on GitHub</a>
  </div>
</div>
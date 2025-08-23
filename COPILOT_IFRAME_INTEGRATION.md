# GitHub Copilot Progress Tracking via Iframe Integration

## Problem Statement

The current GitHub Copilot integration in Morpheum provides minimal progress visibility:
- Users see basic status messages: "🔄 Copilot session status: in_progress - Analyzing codebase..."
- Long periods of silence between updates
- No visibility into what Copilot is actually doing

## Proposed Solution: Iframe Integration

Instead of trying to replicate GitHub's progress tracking via API polling (which has limited granularity), embed GitHub's existing web interface directly in the Matrix client.

## How GitHub Copilot Progress Works

When GitHub Copilot works on an issue:
1. Users can visit the issue page on github.com
2. GitHub shows detailed progress including thoughts, file analysis, command outputs
3. The progress view updates in real-time
4. This rich interface already exists and is maintained by GitHub

## Implementation Approach

### 1. Matrix Web Client Enhancement

Modify the Matrix web client to support iframe embedding for Copilot sessions:

```typescript
interface CopilotProgressFrame {
  sessionId: string;
  issueNumber: number;
  repository: string;
  iframeUrl: string;
}
```

### 2. Enhanced Copilot Messages

When a Copilot session starts, provide both text updates and an embedded iframe by modifying the `CopilotClient.sendStreaming()` method:

```typescript
// In CopilotClient.sendStreaming()
async sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
  // ... existing issue creation logic ...
  
  if (session.issueNumber) {
    const issueUrl = this.buildIssueUrl(session.issueNumber);
    const progressUrl = `${issueUrl}/copilot-progress`; // GitHub's progress interface
    
    // Send text message
    onChunk(`✅ **Issue [#${session.issueNumber}](${issueUrl}) created**\n`);
    onChunk(`🚀 Starting GitHub Copilot session...\n`);
    
    // Send iframe message via HTML formatting
    const iframeHtml = `
      <h4>🤖 GitHub Copilot Progress</h4>
      <p><a href="${issueUrl}" target="_blank">Open in GitHub ↗</a></p>
      <iframe src="${progressUrl}" width="100%" height="600px" 
              frameborder="0" sandbox="allow-scripts allow-same-origin"
              title="Copilot progress for ${this.repository}">
        <p>Your client doesn't support iframes. <a href="${progressUrl}">Track progress here</a></p>
      </iframe>
    `;
    
    // Send as formatted message (Matrix client will render iframe if supported)
    onChunk(`📊 Track detailed progress below:\n${progressUrl}`, iframeHtml);
  }
  
  // ... rest of existing logic ...
}
```

### 3. Iframe URL Construction

The iframe would point to GitHub's native progress interface:
- For issues: `https://github.com/{owner}/{repo}/issues/{number}/copilot-progress`
- For pull requests: `https://github.com/{owner}/{repo}/pull/{number}/agent-sessions/{sessionId}`

### 4. Matrix Client Integration

The Matrix bot already supports HTML formatting via the `matrix-bot-sdk`. To enable iframe support:

```typescript
// In index.ts sendMessage function (already exists)
const sendMessage = async (message: string, html?: string) => {
  if (html) {
    await queueMessage(roomId, {
      msgtype: "m.text",
      body: message,
      format: "org.matrix.custom.html",
      formatted_body: html,
    });
  } else {
    await queueMessage(roomId, {
      msgtype: "m.text",
      body: message,
    });
  }
};
```

Matrix clients that support HTML will render iframes automatically. Clients that don't support iframes will show the fallback text with a direct link to GitHub.

**Client Support:**
- **Element Web**: Full iframe support 
- **Element Mobile**: Limited iframe support, will show link fallback
- **Terminal clients**: Plain text fallback with URL
- **Other clients**: Varies, graceful degradation via fallback content

### 5. Security Considerations

- Use iframe sandbox attributes to restrict capabilities
- Only allow GitHub.com domains in the iframe src
- Validate repository ownership before embedding

```typescript
function validateCopilotIframeUrl(url: string, allowedRepos: string[]): boolean {
  try {
    const parsed = new URL(url);
    
    // Must be GitHub
    if (parsed.hostname !== 'github.com') {
      return false;
    }
    
    // Extract repo from path
    const pathParts = parsed.pathname.split('/');
    if (pathParts.length < 3) {
      return false;
    }
    
    const repo = `${pathParts[1]}/${pathParts[2]}`;
    return allowedRepos.includes(repo);
  } catch {
    return false;
  }
}
```

### 6. Fallback for Non-Web Clients

For Matrix clients that don't support iframes (mobile apps, terminal clients):
- Continue providing text-based progress updates
- Include direct links to GitHub progress pages
- Use progressive enhancement approach

### 7. Implementation Steps

#### Phase 1: Basic Iframe Support
- [ ] Add iframe message type to Matrix client
- [ ] Implement iframe renderer component
- [ ] Add security validation for GitHub URLs

#### Phase 2: Copilot Integration
- [ ] Modify `CopilotClient.sendStreaming()` to send iframe messages
- [ ] Construct GitHub progress URLs from session data
- [ ] Test with real GitHub Copilot sessions

#### Phase 3: UI Polish
- [ ] Add loading states for iframe content
- [ ] Implement responsive sizing
- [ ] Add error handling for failed iframe loads
- [ ] Style integration with Matrix chat theme

#### Phase 4: Advanced Features
- [ ] Auto-refresh iframe when session status changes
- [ ] Notification badges for progress updates
- [ ] Collapsible iframe view option
- [ ] Deep linking to specific progress sections

## Benefits

1. **Rich Progress Visibility**: Users see GitHub's native progress interface with full detail
2. **Zero API Limitations**: No dependency on GitHub API rate limits or missing endpoints
3. **Always Up-to-Date**: GitHub maintains and updates the progress interface
4. **Familiar UX**: Users already know GitHub's interface
5. **Real-Time Updates**: GitHub's native real-time updates work automatically

## User Experience

Instead of:
```
🔄 Copilot session status: in_progress - Analyzing codebase...
[30 seconds of silence]
✅ Copilot session completed!
```

Users will see:
```
🤖 GitHub Copilot Progress for Issue #123
[Live iframe showing detailed progress with thoughts, file analysis, etc.]
📊 Track progress: https://github.com/owner/repo/issues/123
```

## Technical Requirements

- Matrix web client framework (Element Web or custom)
- iframe security policy configuration
- GitHub repository access permissions
- HTTPS for iframe embedding (GitHub requirement)

## Alternatives Considered

1. **API Polling Enhancement**: Limited by GitHub API granularity
2. **Webhook Integration**: GitHub doesn't provide Copilot-specific webhooks
3. **Screen Sharing**: Too complex and doesn't integrate with chat

## Conclusion

Iframe integration provides the best balance of rich functionality, implementation simplicity, and maintenance overhead. It leverages GitHub's existing investment in progress tracking UI while providing seamless integration within the Matrix chat experience.
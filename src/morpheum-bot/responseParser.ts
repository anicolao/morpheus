export function parseBashCommands(text: string): string[] {
  const regex = /```bash\n([\s\S]*?)\n```/gi;
  const commands: string[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    commands.push(match[1].trim());
  }

  return commands;
}


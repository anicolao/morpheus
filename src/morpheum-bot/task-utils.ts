import * as fs from "fs";
import * as path from "path";

export interface TaskMetadata {
  title: string;
  order?: number;
  status: string;
  phase?: string;
  category?: string;
  content: string;
  filename: string;
}

/**
 * Simple front matter parser for task files
 */
function parseFrontMatter(content: string): { frontMatter: Record<string, any>; content: string } {
  const lines = content.split('\n');
  
  if (lines[0] !== '---') {
    return { frontMatter: {}, content };
  }
  
  let frontMatterEnd = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      frontMatterEnd = i;
      break;
    }
  }
  
  if (frontMatterEnd === -1) {
    return { frontMatter: {}, content };
  }
  
  const frontMatterLines = lines.slice(1, frontMatterEnd);
  const contentLines = lines.slice(frontMatterEnd + 1);
  
  const frontMatter: Record<string, any> = {};
  
  for (const line of frontMatterLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      
      // Parse numbers
      if (/^\d+$/.test(value)) {
        frontMatter[key] = parseInt(value, 10);
      } else {
        frontMatter[key] = value;
      }
    }
  }
  
  return {
    frontMatter,
    content: contentLines.join('\n').trim()
  };
}

/**
 * Read and parse task files from the docs/_tasks directory
 */
export async function getTaskFiles(tasksDir: string = "docs/_tasks"): Promise<TaskMetadata[]> {
  try {
    const files = await fs.promises.readdir(tasksDir);
    const taskFiles = files.filter(f => f.endsWith('.md'));
    
    const tasks: TaskMetadata[] = [];
    
    for (const file of taskFiles) {
      const filePath = path.join(tasksDir, file);
      const content = await fs.promises.readFile(filePath, 'utf8');
      const { frontMatter, content: taskContent } = parseFrontMatter(content);
      
      tasks.push({
        title: frontMatter.title || file,
        order: frontMatter.order,
        status: frontMatter.status || 'unknown',
        phase: frontMatter.phase,
        category: frontMatter.category,
        content: taskContent,
        filename: file
      });
    }
    
    return tasks;
  } catch (error) {
    console.error('Error reading task files:', error);
    return [];
  }
}

/**
 * Filter tasks to only include uncompleted ones
 */
export function filterUncompletedTasks(tasks: TaskMetadata[]): TaskMetadata[] {
  return tasks.filter(task => task.status !== 'completed');
}

/**
 * Assemble markdown content from a list of tasks
 */
export function assembleTasksMarkdown(tasks: TaskMetadata[]): string {
  if (tasks.length === 0) {
    return "# Tasks\n\n✅ All tasks are completed! Great work!";
  }
  
  // Sort by order if available, otherwise by filename
  const sortedTasks = tasks.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.filename.localeCompare(b.filename);
  });
  
  let markdown = "# Tasks (Uncompleted)\n\n";
  
  // Group by phase if available
  const groupedTasks = new Map<string, TaskMetadata[]>();
  
  for (const task of sortedTasks) {
    const phase = task.phase || 'Other';
    if (!groupedTasks.has(phase)) {
      groupedTasks.set(phase, []);
    }
    groupedTasks.get(phase)!.push(task);
  }
  
  for (const [phase, phaseTasks] of groupedTasks) {
    if (groupedTasks.size > 1) {
      markdown += `## ${phase}\n\n`;
    }
    
    for (const task of phaseTasks) {
      markdown += `### ${task.title}\n\n`;
      markdown += `**Status:** ${task.status}\n`;
      if (task.category) {
        markdown += `**Category:** ${task.category}\n`;
      }
      markdown += `\n${task.content}\n\n---\n\n`;
    }
  }
  
  return markdown.trim();
}
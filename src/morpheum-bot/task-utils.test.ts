import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { getTaskFiles, filterUncompletedTasks, assembleTasksMarkdown, type TaskMetadata } from './task-utils';

// Temporary test directory
const testDir = '/tmp/test-tasks';

describe('task-utils', () => {
  beforeEach(async () => {
    // Create test directory and sample task files
    await fs.promises.mkdir(testDir, { recursive: true });
    
    // Create a completed task
    await fs.promises.writeFile(path.join(testDir, 'task-001-completed.md'), `---
title: "Completed Task"
order: 1
status: completed
phase: "Phase 1"
category: "Development"
---

- [x] This task is done
- [x] All subtasks completed`);

    // Create an in-progress task
    await fs.promises.writeFile(path.join(testDir, 'task-002-in-progress.md'), `---
title: "In Progress Task"
order: 2
status: in-progress
phase: "Phase 1"
category: "Testing"
---

- [x] First subtask done
- [ ] Second subtask pending
- [ ] Third subtask pending`);

    // Create a task without order
    await fs.promises.writeFile(path.join(testDir, 'task-003-no-order.md'), `---
title: "Task Without Order"
status: pending
phase: "Phase 2"
---

- [ ] Something to do
- [ ] Another thing to do`);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.promises.rm(testDir, { recursive: true, force: true });
  });

  describe('getTaskFiles', () => {
    it('should read and parse task files correctly', async () => {
      const tasks = await getTaskFiles(testDir);
      
      expect(tasks).toHaveLength(3);
      
      const completedTask = tasks.find(t => t.title === 'Completed Task');
      expect(completedTask).toBeDefined();
      expect(completedTask?.status).toBe('completed');
      expect(completedTask?.order).toBe(1);
      expect(completedTask?.phase).toBe('Phase 1');
      expect(completedTask?.category).toBe('Development');
      expect(completedTask?.content).toContain('This task is done');
      
      const inProgressTask = tasks.find(t => t.title === 'In Progress Task');
      expect(inProgressTask).toBeDefined();
      expect(inProgressTask?.status).toBe('in-progress');
      expect(inProgressTask?.order).toBe(2);
    });

    it('should handle files without proper front matter', async () => {
      await fs.promises.writeFile(path.join(testDir, 'invalid.md'), `No front matter here
Just regular content`);
      
      const tasks = await getTaskFiles(testDir);
      const invalidTask = tasks.find(t => t.filename === 'invalid.md');
      
      expect(invalidTask).toBeDefined();
      expect(invalidTask?.status).toBe('unknown');
      expect(invalidTask?.title).toBe('invalid.md'); // fallback to filename
    });

    it('should return empty array for non-existent directory', async () => {
      const tasks = await getTaskFiles('/tmp/non-existent');
      expect(tasks).toEqual([]);
    });
  });

  describe('filterUncompletedTasks', () => {
    it('should filter out completed tasks', async () => {
      const allTasks = await getTaskFiles(testDir);
      const uncompletedTasks = filterUncompletedTasks(allTasks);
      
      expect(uncompletedTasks).toHaveLength(2);
      expect(uncompletedTasks.every(t => t.status !== 'completed')).toBe(true);
      
      const statuses = uncompletedTasks.map(t => t.status);
      expect(statuses).toContain('in-progress');
      expect(statuses).toContain('pending');
    });

    it('should return empty array when all tasks are completed', () => {
      const completedTasks: TaskMetadata[] = [
        {
          title: 'Task 1',
          status: 'completed',
          content: 'Content 1',
          filename: 'task1.md'
        },
        {
          title: 'Task 2', 
          status: 'completed',
          content: 'Content 2',
          filename: 'task2.md'
        }
      ];
      
      const result = filterUncompletedTasks(completedTasks);
      expect(result).toEqual([]);
    });
  });

  describe('assembleTasksMarkdown', () => {
    it('should create markdown for uncompleted tasks', async () => {
      const allTasks = await getTaskFiles(testDir);
      const uncompletedTasks = filterUncompletedTasks(allTasks);
      const markdown = assembleTasksMarkdown(uncompletedTasks);
      
      expect(markdown).toContain('# Tasks (Uncompleted)');
      expect(markdown).toContain('## Phase 1');
      expect(markdown).toContain('## Phase 2');
      expect(markdown).toContain('### In Progress Task');
      expect(markdown).toContain('### Task Without Order');
      expect(markdown).toContain('**Status:** in-progress');
      expect(markdown).toContain('**Status:** pending');
      expect(markdown).not.toContain('Completed Task');
    });

    it('should show completion message when no uncompleted tasks', () => {
      const markdown = assembleTasksMarkdown([]);
      
      expect(markdown).toContain('All tasks are completed! Great work!');
    });

    it('should sort tasks by order when available', async () => {
      const tasks: TaskMetadata[] = [
        {
          title: 'Task B',
          order: 2,
          status: 'pending',
          content: 'Content B',
          filename: 'taskB.md'
        },
        {
          title: 'Task A',
          order: 1,
          status: 'pending', 
          content: 'Content A',
          filename: 'taskA.md'
        }
      ];
      
      const markdown = assembleTasksMarkdown(tasks);
      const taskAIndex = markdown.indexOf('### Task A');
      const taskBIndex = markdown.indexOf('### Task B');
      
      expect(taskAIndex).toBeLessThan(taskBIndex);
    });
  });
});
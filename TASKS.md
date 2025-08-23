# Morpheum Project Tasks

> **📍 NEW WORKFLOW:** This file has been restructured to eliminate merge conflicts and improve collaboration.
> 
> **🔗 View the complete task list at: [https://anicolao.github.io/morpheum/status/tasks/](https://anicolao.github.io/morpheum/status/tasks/)**
>
> **✍️ To add new tasks:** Create individual files in `docs/_tasks/` using the format `task-{number}-{description}.md` instead of editing this file directly. See the [contributing guide](https://anicolao.github.io/morpheum/documentation/contributing/) for details.

## About This Task List

This task management system has been migrated to a directory-based structure to resolve constant merge conflicts that occurred when multiple contributors (human developers and AI agents) tried to update the centralized file simultaneously.

### New Workflow

Each task is now a separate file in the `docs/_tasks/` directory with YAML front matter containing metadata like title, order, status, phase, and category. The files are automatically aggregated into a unified view on the GitHub Pages site in forward chronological order.

### Format

New task entries should follow this format:

```yaml
---
title: "Brief description of the task"
order: 1
status: open  # or completed
phase: "Project Phase Name"
category: "Task Category"
---

- [ ] Task description with checkboxes for sub-items
- [ ] Additional requirements
- [x] Completed sub-tasks
```

### Status Values
- `open` - Task not yet started or in progress
- `completed` - Task finished

### Viewing All Tasks

The unified task list with all entries is available at: [https://anicolao.github.io/morpheum/status/tasks/](https://anicolao.github.io/morpheum/status/tasks/)

**Total entries migrated:** 81 tasks spanning all project phases and development areas.

---

*This file serves as documentation for the new workflow. All historical tasks have been preserved and migrated to the new directory structure.*

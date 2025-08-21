---
layout: page
title: Tasks
permalink: /status/tasks/
---

# Tasks

This page tracks all current and completed tasks for the Morpheum project. Tasks are organized chronologically with the most recent additions at the bottom.

{% assign sorted_tasks = site.tasks | sort: 'order' %}
{% for task in sorted_tasks %}
## {{ task.title }}

{{ task.content }}

---
{% endfor %}

## Contributing Tasks

To add a new task:

1. Create a new file in `docs/_tasks/` with the naming convention `task-{number}-{short-description}.md`
2. Include front matter with `title`, `order`, and `status` fields
3. Write the task description in markdown
4. This page will automatically include your new task

For more information, see our [contributing guide](/documentation/contributing/).
---
layout: page
title: Development Log
permalink: /status/devlogs/
---

# Development Log

This page tracks the development of Morpheum using Morpheum itself. Our main goal is to minimize manual work, letting AI agents handle most tasks by generating project markdown. Entries are shown in reverse chronological order (newest first).

{% assign sorted_devlogs = site.devlogs | sort: 'date' | reverse %}
{% for devlog in sorted_devlogs %}
## {{ devlog.date | date: "%Y-%m-%d" }}: {{ devlog.title }}

{{ devlog.content }}

---
{% endfor %}

## Contributing to the Development Log

To add a new development log entry:

1. Create a new file in `docs/_devlogs/` with the naming convention `{YYYY-MM-DD}-{short-description}.md`
2. Include front matter with `title`, `date`, and optional fields like `author` and `tags`
3. Write the log entry in markdown following our established format:
   - **High-Level Request:** or **Actions Taken:**
   - **Friction/Success Points:**
   - **Technical Learnings:** (optional)
4. This page will automatically include your new entry at the top

For more information, see our [contributing guide](/documentation/contributing/) and the [agent guidelines](https://github.com/anicolao/morpheum/blob/main/AGENTS.md).
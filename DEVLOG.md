# DEVLOG

## Morpheus Development Log

This log tracks the development of `morpheus` using `morpheus` itself. Our main goal is to minimize manual work, letting AI agents handle most tasks by generating project markdown. This explains why we sometimes hit snags and have to work around them.

## Changelog

*   **DEVLOG.md Editing Pass:** Performed an editing pass on this `DEVLOG.md` file to make it briefer and less formal, without losing any content. Reduced word count from 700 to 500 words. (Note: Obtaining the previous word count required instructing the Gemini CLI to use `git show` and then count words, highlighting a current friction point in fully automated metrics gathering.)
*   **GPLv3 License Added (Current):** We just added the GPLv3 license. We used `google_web_search`, `web_fetch`, and `write_file` for this. However, the file created by the CLI was eventually discarded, and the license was added manually via GitHub's UI.
*   **Initial License Attempt (MIT):** Earlier, Gemini picked an MIT license, which we didn't want. Trying to switch to GPL caused the CLI to hang during a git rebase, so we abandoned that approach.
*   **README Drafted:** The `README.md` was initially drafted by the Gemini CLI (`gemini-2.5-flash`). It was mostly good, but the architecture section was a hallucination and needed a rewrite.
*   **GitHub Repo Created:** A big win was the Gemini CLI creating the local GitHub repo from scratch and pushing it using `gh`. I had to authenticate manually, but the CLI handled the initial README and git setup.
*   **Project Context Setup:** We started by setting up the development environment and giving the `morpheus` CLI its current context.

### Tools Used

*   **`tmux`**: For managing multiple terminals.
*   **`Gemini CLI`**: Our main AI agent for content creation.
*   **`glow`**: For previewing markdown before pushing.
*   `google_web_search`: For research and finding license text.
*   `web_fetch`: For getting web content.
*   `write_file`: For creating and updating files.

### Frustrations

*   **`gh` CLI Limitations:** No direct `gh` command to add licenses, forcing manual steps.
*   **`web_fetch` Behavior:** Initially returned summaries instead of raw text, requiring more specific requests.
*   **CLI Instability (Git):** The Gemini CLI hung during a git rebase attempt.
*   **Inconsistent CLI Behavior:** The license addition process wasn't as smooth this time, leading to manual intervention.

### Experience Building Morpheus with Morpheus

It's been a mixed bag. The CLI's ability to interact with the file system and web is powerful. But issues like hallucinated content, CLI hangs, and inconsistent behavior show that `morpheus` still needs human oversight. While functional, the process can be indirect and sometimes unreliable, sometimes requiring manual workarounds (like adding the license via GitHub UI). All commits to the repository will now be reflected with at least one comment in this worklog to reflect the work done and any challenges encountered.

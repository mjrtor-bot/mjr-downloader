# Codex for Open Source — application preparation

> Internal preparation document. Not an official application or evidence of acceptance.

## Project

- Repository: https://github.com/mjrtor-bot/mjr-downloader
- Project: MJR Downloader
- Public repository: yes (verified on GitHub)
- Purpose: web application for inspecting formats and downloading publicly available media when the user has permission.
- Technology: Next.js, TypeScript, yt-dlp and FFmpeg.
- Architecture: Next.js interface/API and selectable local or external media worker.
- Existing documented safeguards: URL validation, SSRF protections, command execution via spawn, and rate limiting. These claims require code-level validation.

## Draft application description (English)

MJR Downloader is a publicly available TypeScript/Next.js project that helps users inspect media formats and download media they are authorized to access. Its architecture separates the web application from media processing providers, enabling local processing with yt-dlp/FFmpeg or deployment with a dedicated worker. The project aims to provide a reusable foundation for safe media-processing workflows, with attention to URL validation, server-side resource controls, and responsible usage.

We are preparing the repository for external contributions through contribution guidelines and a responsible security-reporting process. Codex could help maintainers review changes, strengthen automated tests, investigate security issues, and improve documentation for future contributors.

## Verification checklist before submitting

- [ ] Confirm that the maintainer has rights to license all original code and identify third-party code/assets.
- [ ] Choose and publish an OSI-approved license after rights review.
- [ ] Review current source and full Git history for exposed secrets and sensitive data.
- [ ] Verify security claims against implementation and automated tests.
- [ ] Confirm build, lint and integration tests.
- [ ] Gather accurate activity, adoption, contributions and community-impact evidence.
- [ ] Confirm current OpenAI program terms and eligibility on the official application page.
- [ ] Submit the form from the maintainer's authenticated account; do not claim approval in advance.

Do not claim external users, contributors, download counts, security certification, or established community adoption without evidence.

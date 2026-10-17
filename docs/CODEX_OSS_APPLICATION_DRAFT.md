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


## Official Codex for Open Source form — ready-to-paste answers (2026-10-16)

Application: https://openai.com/form/codex-for-oss/

- GitHub username: `mjrtor-bot` (verify public profile visibility)
- Repository URL: https://github.com/mjrtor-bot/mjr-downloader
- Maintainer role: Primary maintainer (confirm before submission)
- Interests: Codex Security; API credits for my project (select only if desired)
- ChatGPT account email: **REQUIRED FROM APPLICANT — DO NOT GUESS**
- OpenAI Organization ID: **REQUIRED FROM APPLICANT — DO NOT GUESS**
- Legal first/last name: **CONFIRM WITH APPLICANT**

**Why does this repository qualify?** (max 500 characters)

MJR Downloader is an actively maintained public Next.js/TypeScript project for inspecting media formats and downloading content users are authorized to access. It uses yt-dlp/FFmpeg and supports local or external workers. The repository has ongoing CI, security hardening, and contributor documentation work. We aim to make its media-processing architecture reusable and safer for the open-source community. Adoption metrics are not yet established.

**How will you use API credits?** (max 500 characters)

Use Codex/API credits to review pull requests, propose and validate tests for URL handling and media workers, triage security findings, improve documentation, and automate routine maintenance. We will keep human review for security-sensitive changes and avoid processing unauthorized or DRM-protected content.

**Anything else?** (max 500 characters)

This is an early-stage project under active maintenance. CI has passed lint and build on pull request #4 (run 38984430092), but functional and security reviews are still ongoing. We do not claim established adoption, a completed security audit, or external contributors. The application is for assistance with sustainable, responsible maintenance.

**Submission status:** NOT SUBMITTED. Submission requires the applicant's verified account email, OpenAI organization ID, confirmation of role/identity, and agreement to the program terms. Passing CI is not a security certification.

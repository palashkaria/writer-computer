# MDX recognition worksheet

Task: [MDX recognition](../mdx-file-recognition.md), tracked in TODOS.md.

Reviewed: AGENTS.md, docs/vite-plus.md, docs/consolidation.md, agent-loop.md, agent-review.md; Rust filesystem/search/watcher/recents/open-target filters, frontend path/wiki-link helpers, Tauri bundle configuration.

Plan: reuse the existing Rust open-target extension predicate across backend consumers; add MDX to frontend link handling and bundle associations. Add behavior-level tests before implementation, then run Rust and frontend checks and build a local app with a distinct name/identifier and updater artifacts disabled. No MDX runtime/compiler changes.

Validation: the original `cargo test mdx_only_directory --lib` failed with "MDX-only folder must be visible"; the initial frontend link tests also failed. After the fix, `cargo test` passes 169 tests and `vp test` passes 577 tests. `vp check` reports zero errors and one existing warning in e2e/wdio.conf.js; `cargo clippy` reports zero errors and nine existing warnings; `cargo fmt --check` passes. Release app build succeeds. Read/write coverage preserves JSX and import bytes; sidebar tests cover pre-index and index-ready states plus recents.

Separate Rust/Tauri and QA reviewers found no remaining actionable findings after correcting the custom Info.plist association, uppercase explicit wiki links, CLI help, and watcher handling of directories with Markdown suffixes. The shared watcher predicate remains lexical for vanished paths. Native UI inspection is unavailable because the Computer Use client/server versions mismatch; ChatGPT must be relaunched to restore that tool. No website source files were edited.

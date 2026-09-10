# Keyboard scroll stall investigation

Request: holding Down in a long document scrolls initially, then the viewport stops following.

Reviewed: docs/editor.md, scroll container/theme, editor extension assembly, heading guard, arrow reveal extension, CodeMirror scroll implementation, existing native E2E setup. Working tree was clean. Current native document: herdr-ghostty-shortcuts.mdx.

Reproduction work: repeated Down changes accessibility content while the visible viewport stays fixed; wheel scrolling moves it. Building isolated native E2E binary to record actual selection, ancestor scroll offsets, and geometry before drawing a causal conclusion. No product changes yet.

Plan: establish a native regression loop, minimize, compare cursor trapping vs ancestor-scroll handling vs visual compositor stall, then document findings and any verified fix.

Confirmed cause: CodeMirror's ancestor scroll walk clamps the target caret rectangle to the fixed-height ProseMarkEditor wrapper before it reaches the real scroller. Native focused red loop: 135/150 Down presses outside viewport (scroll stalls at 381px). Height-only runtime fix: 150/150 remain visible, scroll reaches 1850px. Plan: replace h-full with min-h-full, retaining empty/short editor minimum height, and verify native Markdown fixture both directions plus all standard checks. Spec: ../keyboard-scroll-stall.md.

## Result

Changed the mount from h-full to min-h-full, documented the ancestor constraint, and added a self-contained native E2E fixture/helper. Permanent helper failed on the original layout with `Caret escaped the visible viewport`. The rebuilt test app passed `keyboard-scroll.spec.js` on macOS WKWebView (Down+Up, focus, document boundaries, unchanged content). Short and empty documents both retained a 776px mount matching the 776px scroll viewport.

Combined-build validation before branch isolation: vp check passes with one existing e2e config warning; vp test passes 577 tests; cargo test passes 169 tests; cargo clippy has no errors and nine existing warnings; cargo fmt --check passes. Regular Writer MDX release rebuilt successfully without the E2E feature. Editor and QA reviewers approved the final changes. No temporary runtime probes were added to product source. Native reproduction used a copy under /tmp and did not change the user's source document.

This fix is isolated on fix/keyboard-scrolling, based directly on the user's fork master. MDX recognition is a separate change on fix/mdx-support.

Independent branch validation: vp check passes (one existing warning), all 573 frontend tests pass, the isolated native app builds, and keyboard-scroll.spec.js passes on WKWebView with both Down and Up. Both fix branches contain exactly one commit above fork/master.

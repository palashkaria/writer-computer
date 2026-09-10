# Keyboard scroll stalls in long documents

Holding Down must keep the caret in the visible editor viewport until it reaches the end of the document; Up must work in reverse. This applies to plain Markdown and MDX and must not change document contents.

## Cause and change

`ProseMarkEditor` mounts CodeMirror inside an `h-full` wrapper. The wrapper is constrained to the scroll viewport height while its long editor child overflows visibly. CodeMirror walks ancestors to scroll the caret into view and clamps its target rectangle to each ancestor's bounds. The short wrapper clips that rectangle before it reaches the actual outer scroller, so the outer scroll offset stops advancing while the caret continues off-screen.

Use `min-h-full` instead: retain the minimum editing area for short documents, but let the wrapper grow to contain long content. Keep the existing outer scroll owner, fade masks, and search scroll handler.

## Validation

Native WKWebView reproduction on a temporary MDX copy: 150 repeated Down key events with focus retained; 135 left the caret below the visible viewport with the original wrapper. Changing only its height to auto kept the caret visible through the end.

The native E2E regression creates its own 100-line Markdown fixture and runs actual CodeMirror key handlers in both directions, asserting caret visibility, movement beyond a viewport, focus, and arrival at document boundaries. It requires the existing e2e-feature app build; no WebDriver capability is enabled in the ordinary app.

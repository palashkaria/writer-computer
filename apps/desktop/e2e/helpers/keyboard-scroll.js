import { ok, strictEqual } from "node:assert/strict";

/** Exercise the actual CodeMirror keymap and native WebKit layout. */
export async function checkKeyboardScroll(browser, direction = "down") {
  const result = await browser.executeAsync((direction, done) => {
    const content = document.querySelector(".cm-content");
    // The pinned CodeMirror version exposes its EditorView through the root tile.
    const view = content?.cmTile?.view;
    if (!view) return done({ failure: "Expected a mounted CodeMirror editor" });
    let scroller = view.dom.parentElement;
    while (scroller && !["auto", "scroll"].includes(getComputedStyle(scroller).overflowY)) {
      scroller = scroller.parentElement;
    }
    if (!scroller) return done({ failure: "Missing outer editor scroller" });
    const originalDoc = view.state.doc.toString();
    const down = direction === "down";
    view.focus();
    view.dispatch({
      selection: { anchor: down ? 0 : view.state.doc.length },
      scrollIntoView: true,
    });
    const pause = () => new Promise((resolve) => setTimeout(resolve, 20));
    void (async () => {
      try {
        await pause();
        const startScroll = scroller.scrollTop;
        let maxScroll = startScroll;
        for (let step = 0; step < 160; step++) {
          content.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: down ? "ArrowDown" : "ArrowUp",
              code: down ? "ArrowDown" : "ArrowUp",
              repeat: step > 0,
              bubbles: true,
              cancelable: true,
            }),
          );
          await pause();
          const head = view.state.selection.main.head;
          const caret = view.coordsAtPos(head);
          const bounds = scroller.getBoundingClientRect();
          if (!view.hasFocus) return done({ failure: "Test window lost focus" });
          if (!caret || caret.top > bounds.bottom + 2 || caret.bottom < bounds.top - 2) {
            return done({
              failure: "Caret escaped the visible viewport",
              step,
              head,
              scrollTop: scroller.scrollTop,
              caretTop: caret?.top,
              viewportBottom: bounds.bottom,
            });
          }
          maxScroll = Math.max(maxScroll, scroller.scrollTop);
          if (head === (down ? view.state.doc.length : 0)) {
            return done({
              head,
              unchanged: view.state.doc.toString() === originalDoc,
              expected: down ? view.state.doc.length : 0,
              startScroll,
              endScroll: scroller.scrollTop,
              maxScroll,
              viewportHeight: scroller.clientHeight,
            });
          }
        }
        done({ failure: "Arrow navigation did not reach the document boundary" });
      } catch (error) {
        done({ failure: String(error) });
      }
    })();
  }, direction);
  ok(!result.failure, JSON.stringify(result));
  strictEqual(result.head, result.expected);
  strictEqual(result.unchanged, true, "Arrow navigation must not edit the document");
  ok(result.maxScroll > result.viewportHeight, "Long document should scroll beyond one viewport");
  if (direction === "up")
    ok(result.endScroll < result.startScroll, "Up should scroll back toward the start");
  return result;
}

import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ok } from "node:assert/strict";
import { checkKeyboardScroll } from "../helpers/keyboard-scroll.js";

describe("keyboard scrolling through a long document", function () {
  let directory;
  let originalWindow;
  let fixtureWindow;

  before(async function () {
    directory = mkdtempSync(join(tmpdir(), "writer-keyboard-scroll-"));
    const path = join(directory, "long.md");
    writeFileSync(
      path,
      Array.from({ length: 100 }, (_, i) => `Line ${i + 1}: scroll check.`).join("\n"),
    );
    originalWindow = await browser.getWindowHandle();
    const before = await browser.getWindowHandles();
    const error = await browser.executeAsync(
      (root, file, done) => {
        window.__TAURI_INTERNALS__
          .invoke("open_workspace_in_new_window", { path: root, file })
          .then(
            () => done(null),
            (error) => done(String(error)),
          );
      },
      directory,
      path,
    );
    ok(!error, error);
    await browser.waitUntil(async () => {
      fixtureWindow = (await browser.getWindowHandles()).find((handle) => !before.includes(handle));
      return !!fixtureWindow;
    });
    await browser.switchToWindow(fixtureWindow);
    await $(".cm-content").waitForDisplayed();
  });

  after(async function () {
    if (fixtureWindow) {
      await browser.switchToWindow(fixtureWindow);
      await browser.closeWindow();
    }
    if (originalWindow) await browser.switchToWindow(originalWindow);
    if (directory) rmSync(directory, { recursive: true, force: true });
  });

  it("keeps the caret visible when repeatedly moving down and up", async function () {
    await checkKeyboardScroll(browser, "down");
    await checkKeyboardScroll(browser, "up");
  });
});

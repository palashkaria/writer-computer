# MDX file recognition

Recognize `.mdx` case-insensitively alongside `.md` and `.markdown` in folder browsing, indexing/search, watching, recents, direct opens, links, and macOS associations. Preserve MDX source verbatim through file read/write; use the existing Markdown editor without executing JSX or imports. Keep new-file defaults as `.md`.

Validate actual sidebar and index behavior using an MDX-only nested directory, direct opens, recents, watcher subtree discovery, and frontend links. Build a separate local app for trying the existing palash.co workspace.

## Local build

From `apps/desktop`, with `vp` available on PATH:

```sh
vp exec tauri build --bundles app --config tauri.mdx-local.json --ci
```

The override produces `src-tauri/target/release/bundle/macos/Writer MDX.app` with a separate bundle identifier, ad-hoc signing, no upstream updater endpoints, and no updater artifacts. The ordinary Writer build configuration retains its original identity. The local override can be omitted for a normal build.

For this checkout, Vite+ is installed at `~/git/external/.writer-vite-plus`. Set `VP_HOME` to that directory and prepend its `bin` directory to PATH when rebuilding.

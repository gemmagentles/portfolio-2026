# UX tests

Tests of how the site behaves for a visitor: what they see, when they see it, and what happens when they do something.
Each one drives the built site in a real Chrome (headless), the way a visitor would, and checks the result.

Run them all:

```sh
npm run test:ux
```

That builds the site, then runs every `*.test.js` file in this folder with Node's test runner. Each file starts the
site's preview server and Chrome itself (`helpers.js`) and closes them after. It needs Chrome installed (set
`CHROME_PATH` if it isn't in the usual place). Run one file on its own with `npm run build` then
`node --test tests/ux/<file>.test.js`.

## The tests

| File | What it checks |
| --- | --- |
| `contact-still-needed.test.js` | The contact form's "Still needed" list stays hidden until the visitor has had a go: a field's pill appears only after they skip it, leave it wrong or press Send without it, each pill on its own, and it goes once put right. |

## Adding a test

1. Write down the rule in plain words at the top of a new `<what-it-checks>.test.js` file: what the visitor should
   experience, and why.
2. Start the site with `startSite()` in `before`, stop it in `after`, and open pages with `openPage()`.
3. Act like a visitor (click, type, leave a field, press a button), then check what they'd see with `assert`.
4. Add a line to the table above.

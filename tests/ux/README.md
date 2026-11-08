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
| `contact-greeting.test.js` | Once the name is filled in, the green line greets the visitor by their first name ("✓ Nice to meet you, Alex"), shown as plain text, and goes back to the plain greeting when the name is cleared. |
| `contact-left-empty.test.js` | A field left empty turns red and says "Please fill in…" once the visitor has had a go at it (left it or pressed Send), never before; the message goes when they start typing, and Send on an empty form shows it for every field. |
| `contact-errors-for-screen-readers.test.js` | Screen reader users hear what others see: a field tried and still not right is marked invalid (never before they've had a go, unmarked once put right), and a Send that can't go yet announces how many fields need attention and which ("2 fields need attention: Full name, Work email."), then goes to the first. |

## Adding a test

1. Write down the rule in plain words at the top of a new `<what-it-checks>.test.js` file: what the visitor should
   experience, and why.
2. Start the site with `startSite()` in `before`, stop it in `after`, and open pages with `openPage()`.
3. Act like a visitor (click, type, leave a field, press a button), then check what they'd see with `assert`.
4. Add a line to the table above.

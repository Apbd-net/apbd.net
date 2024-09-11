# apbd.net

The source code for the official apbd.net website. Contains the landing page, and the different tools.

## Source Code

### Backgound

The websites "original" source code appears in the `source` directory, and is programmed using `html`-`css`-`js`.

The final, deployed version of the website exists in the `build` directory, and is regenerated every time the website is updated.

The website source is compiled into the built form using a `nodejs` script residing in the `compiler` folder.

### "Sub-Projects"

Different and seperate "programs" within the websites are called tools. each tool has its own `ID`, which is used both programmatically (for example, in the file structure; more on that later) and as a referencing utility (for example: github issues/pull requests).

As of writing this, only one tool exists:

- `foods`: Referred to (on the tools web-page) as "Allowed Foods List" - contains a massive list of many different foods and their nutritional values.

### Structure

The website's content is split into 4 directories:

- `source/html`: the websites structure and content. Different tools are stored within different subfolders, depending on their `ID`, with the websites main, landing page having an id of `landing-page`. As of writing this, contains 1 tool, and two folders:
  - `./foods`
  - `./landing-page`
- `source/css`: Generally follows the same folder structure as `source/html`, but is not required to. When compiled, files here are copied over to the `build/css` directory.
- `source/js`: Contains javascript files, to be executed by different portions of the website. Doesn't follow any specific file structure. Just like css, javascript files are copied over to their corresponding locations in `build/js`.
- `source/img`: Contains website assets. Generally doesnt change. Also copied over after each compilation.

### Translations

To provide translations, language-code html attributes are added to elements:

```html
<span en="Visible in english" he="גלוי כשהאתר בעברית"></span>
```

In the same vein, existing attributes can vary between translations using the language code as a suffix to the attribute:

```html
<html dir-en="ltr" dir-he="rtl">
    ....
</html>
```

> This is applicable to every single attribute, with support for custom ones.

## Compiler Documentation

### CLI

Currently, the compiler supports 3 "compilation modes", whih can be toggled using command line arguents:

- **`--continuous`**, `--c`: Builds source code, and continues watching for file changes in the source code. When a file is saved, it recompiles.
- **`--launch-dev-server`**, `--lds`, `--d`: When paired with `--continuous`, launches a web server at `127.0.0.1/8080` after the initial compilation. That web servers updates when a file is changed.
- **`--migrate-translation-system`**, `--mts`, `--m`: Deprecated - in a previous iteration of this website, a different translation system was used. This is used to migrate the old to the new translation system.

### Features

- **File-specific scripts**: Run a script when a file is getting built. You can modify the file using that script, or just grab its contents.
- **Excluded Paths**: Allows a list of path to be exluded when building the tools. Works per tool.


## Workflow

### Contribute

Contributions are very welcomed and encouraged :D

If you want to contribute, you can do so using pull requests.
As of now, theres no specific pattern to follow - write whatever you want in there - jsut make sure its relevant (or at least funny).

It is recommended to check out the Compiler's Documentation before starting out, to help you with building the website and making sure your PR works before submitting it.

### Branches

For comfort, git branche names follow a Gitflow-esque pattern:

> Reminder: the "tool ID" of the main website's landing page is `landing-page`.

- **`tool/<tool-id>*`**: A branch representing the development of a new tool. The word after the slash should be the tool's `ID`. (for example: `tool/recipes`).
- **`feature/<tool-id>/*`**: A branch proposing a new feature for a tool. The word after the first slash should be the tool's `ID`. Anything after the second slash is the description (for example: `feature/foods/contribution-leaderboards`)
- **`fix/<tool-id>/*`**: A branch proposing a bug fix for a tool. The word after the first slash should be the tool's `ID`. Anything after the second slash is the description (for example: `fix/foods/contribution-leaderboards`)
- **`qol/<tool-id>/*`**: Similar to `fix/`, but for quality-of-life improvements.

### @ApbdDotNetBot

Some commits, issues and pull requests may be posted by @ApbdDotNetBot. These are usually user submitted feedbacks of any type. Any commit/pull request/issue made by the bot should be prefixed by one of the prefixes below:

- **`[BOT]`**: Anything the doesnt have an immidiate effect on the website when submitted (mainly issues & pull requests).
- **`[REMOTE]`**: When "administrator" programs make changes to the website (for example, this commit: 58a7691c8d780d465cd0c58e2b5b6865610f808f).
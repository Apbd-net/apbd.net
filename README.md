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



# Default docfx Site Template

Default site template for https://github.com/dotnet/docfx

### Development Setup

To develop the template with docfx v3:
- Install the latest version of docfx v3 using the instruction [here](https://github.com/dotnet/docfx/tree/v3#getting-started).
- Run `docfx build --template {template-folder} {docset-path}`
    - `template-folder` is the directory of your local checkout of this repository.
    - `docset-path` is the directory that contains `docfx.json` file.
- Copy the `styles`, `fonts` folder to `{docset-path}/_site`.
- Start a local HTTP static file server in `{docset-path}/_site`. [http-server](https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http) is a good option if you already have node js.
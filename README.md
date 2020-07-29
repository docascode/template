# Default docfx Site Template

Default site template for https://github.com/dotnet/docfx

### Development Setup

To develop the template with docfx v3:
- Install the latest version of docfx v3 using the instruction [here](https://github.com/dotnet/docfx/tree/v3#getting-started).
- Run `docfx build --template {template-folder} {docset-path}`
    - `template-folder` is the directory of your local checkout of this repository.
    - `docset-path` is the directory that contains `docfx.json` file.
      > v3 is a breaking change in a lot of ways. Test it with [this docset](https://github.com/dotnet/docfx/tree/v3-template/docs).
- Copy the `styles`, `fonts` folder to `{docset-path}/_site`.
  > This will be copied automatically in the future, but for now it is a manual step.
- Start a local HTTP static file server in `{docset-path}/_site`. [http-server](https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http) is a good option if you already have node js.

> To show contributor list locally, set `DOCFX_GITHUB_TOKEN` environment variable to your GitHub personal access token.
# Default docfx Site Template

Default site template for https://github.com/dotnet/docfx

### Development Setup

To develop the template:

- Install [.NET Core](https://www.microsoft.com/net/download)
- Install latest `docfx` pre release:
```powershell
dotnet tool update -g docfx --version "3.0.0-*" --add-source https://docfx.pkgs.visualstudio.com/docfx/_packaging/docs-public-packages/nuget/v3/index.json
```
- Build the samples website using this template
```powershell
docfx build samples --template .
```
- Start a local HTTP static file server in `_site`. [http-server](https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http) is a good option if you already have node js.
```powershell
http-server samples/_site
```

> To show contributor list locally, set `DOCFX_GITHUB_TOKEN` environment variable to your GitHub personal access token and rebuild.

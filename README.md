# Default docfx Site Template

Default site template for https://github.com/dotnet/docfx

### Development Setup

To develop the template:

- Install [Node.js](https://nodejs.org/)
- Install [yarn](https://yarnpkg.com/)
- Install [.NET Core](https://www.microsoft.com/net/download)
- Install the latest `docfx` pre-release:
```powershell
dotnet tool update -g docfx --version "3.0.0-*" --add-source https://docfx.pkgs.visualstudio.com/docfx/_packaging/docs-public-packages/nuget/v3/index.json
```

- Build the site template using
```powershell
yarn build
```

- Start a local development server using
```powershell
yarn start
```

To show contributor list locally, create a `docfx.yml` file under `%USERPROFILE%/.docfx` with the following content:

```yml
secrets:
  githubToken: {your-github-personal-access-token}
```

Make sure the GitHub personal access token has read access to `repo` and `user.email`.

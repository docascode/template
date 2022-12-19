# Default docfx Site Template

> ⚠️⚠️⚠️ This repository is archived, the template will be developed in the <https://github.com/dotnet/docfx> repo.

Default site template for [docfx](https://github.com/dotnet/docfx).

Sample site: https://docascode.github.io/template/

### Development Setup

To develop the template:

- Install [Node.js](https://nodejs.org/)
- Install [yarn](https://yarnpkg.com/)
- Install [.NET Core](https://www.microsoft.com/net/download)

- Checkout submodules using
```
git submodule update --init
```

- Build the site template using
```powershell
yarn
yarn build
```

- Start a local development server using
```powershell
yarn start
```

To show contributor list locally, set the `DOCFX__SECRETS__GITHUB_TOKEN` environment variable to a GitHub token with read access to `repo` and `user.email`.

# Getting Started

This tutorial shows how to build a documentation website.

You'll learn how to:

- Create the documentation project.
- Add a homepage.
- Add a markdown document.

## Installation

The easiest way to install docfx is to use [.NET Tools](https://docs.microsoft.com/en-us/dotnet/core/tools/global-tools). Install the latest version of [.NET SDK](https://dotnet.microsoft.com/en-us/download/visual-studio-sdks) and run:

```
dotnet tool install -g docfx
```

Or you can download from [GitHub Releases](https://github.com/dotnet/docfx/releases).

## Create a documentation project

Open a command shell, and enter the following command:

```
docfx new conceptual -o mydocs
```

The preceding command creates a new documentation project. The `-o mydocs` parameter creates a directory named `mydocs` with the project files inside.

## Run the website locally

Run the following command:

```
docfx build mydocs
docfx serve mydocs --watch
```

After the command shell indicates that the website has started, browse to https://localhost:5001.


[!code[name](toc.yml?highlight=1,2-2,4-)]
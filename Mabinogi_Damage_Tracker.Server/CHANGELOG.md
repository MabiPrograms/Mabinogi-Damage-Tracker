This file explains how Visual Studio created the project.

The following steps were used to generate this project:
- Create new ASP\.NET Core Web API project.
- Update project file to add a reference to the frontend project and set SPA properties.
- Update `launchSettings.json` to register the SPA proxy as a startup assembly.
- Add `dockerfile` to set up docker build.
- Add project to the startup projects list.
- Write this file.

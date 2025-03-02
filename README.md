# Nimble

Nimble

## Setup

### Database

Because the database is hosted in a private zone, if you want to access the database, you have to access through a PortForwardingSession.

Set aws configure --profile nimble to use credentials from AWS Development Account. Refer to <https://dh-jira.atlassian.net/l/cp/htPJDFBU>

Run `yarn db` to forward RDS connection to localhost environment with port `5433` to avoid the conflict with the local port 5432. The connect the database with host `localhost`, port `5433` and keep username, password and database as the original connection in RDS. Check ssh username in db script in package.json to make sure it matches with your ssh username.

## Configuration

Configurations are handled by `nestjs` using `dot-env` to load. When running the app, it will load `.env` in the project root.

After cloning this repository, create `.env` in the root folder, copy variable from `.env.example` and fill out your variables.

## Build and Run

Use `yarn build` to build the server app and store it in `dist`.

Run `yarn start` to start the server app using your configuration file.

Run `yarn dev` to run the application.

## Prisma

Before starting the server, you have to generate prisma client and models.

Run `yarn prisma:g` to generate the prisma client and models

Run `yarn prisma:m-c` to create migration scripts

You can generate the script first, review and modify if necessary before executing it.

Run `yarn prisma:m` to create migration script and run it

Run `yarn prisma:deploy` to deploy the migration scripts

**Recommendation**: run `yarn prisma:m-c` first, then review the script before running `yarn prisma:m` to deploy the migration scripts.

## Test

Use `yarn test` to run unit testing once with coverage.

### Code Coverage

Generate code coverage by running `yarn test:ci`.

## Lint

This project uses `eslint` to enforce coding styles.

Use `yarn lint` to validate your code. No changes will be made.

## Installing New Packages

When installing a new package, only install it as a dependency if the application needs the package to run in production.
All other packages should be installed as a dev dependency.
The build scripts will only install non-dev dependencies to keep the package as small as possible.

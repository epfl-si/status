

# Status — EPFL SI

>[!NOTE]
> This website is created from the [EPFL's next.js starter kit](https://github.com/epfl-si/next-starterkit)

A simple next.js monitoring solution based on Prometheus.

# Summary
<!-- First install "Markdwon all ine one" extension by Yu Zhang. Put after theses lines, ctrl + shift + p and write "Markdown" and click to "Markdwon all ine one: Create table of Content" -->
- [Status — EPFL SI](#status--epfl-si)
- [Summary](#summary)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
  - [Clone the projet](#clone-the-projet)
  - [Edit Alertmanager config](#edit-alertmanager-config)
  - [Launch Docker compose (dev kit)](#launch-docker-compose-dev-kit)
  - [Define environment variables](#define-environment-variables)
  - [Launch Web Application (dev mode)](#launch-web-application-dev-mode)
- [Launch unit test](#launch-unit-test)
- [Deploy with Kubernetes](#deploy-with-kubernetes)

# Requirements

- [Bun](https://bun.sh/) ≥ 1.2
- A Microsoft Entra ID app registration with the following redirect URI: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
- Access rights to the team `epfl_status` in keybase
- Be member of group "status-admins" in groups.epfl.ch

# Getting Started

## Clone the projet

First, to use the projet locally, you need to clone the projet
Here the command below.

```sh
git clone git@github.com:epfl-si/status.git
cd status # Go to the root of the project
```

## Edit Alertmanager config

First, you need to get secrets for email credentials.

Move to `/devkit/alertmanager`

Copy `config.yml.example` and rename it to `config.yml`

In this YML file, there is at the top, a "global" attributes with smtp variables as below
```yml
global:
  smtp_smarthost: ''
  smtp_auth_username: ''
  smtp_auth_password: ''
  smtp_require_tls: true
  smtp_from: '' # smtp_from have the same value as smtp_auth_username
```

Fill empty values with secrets from following files : `/keybase/team/epfl_status/secrets.yaml`

## Launch Docker compose (dev kit)

Now,to have Prometheus, Alertmanager and Blackbox Exporter containers, you need to move to the devkit folder and to start the docker compose as below.

```sh
cd devkit # Go to the /devkit
docker compose up -d # Start the docker compose
```

If you want to restart the Dev kit, just stop and restart the docker compose by using theses following commands

```sh
cd devkit # Go to the /devkit if you're not already
docker compose down # Stop the docker compose
docker compose up -d # Start the docker compose
```

## Define environment variables

Before starting the web application, copy the `.env.example` and rename it `.env.local`.

```sh
cd .. # Go back to the root of the project
cp .env.example .env.local
vi .env.local # fill in .env.local using nano, vi, vim, or your favorite text editor
```

The file look like this

```sh
AUTH_SECRET=
ENTRA_ID=
ENTRA_SECRET=
ENTRA_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
PROMETHEUS_API_URL="http://localhost:9090"
ALERTMANAGER_API_URL="http://localhost:9093"
BLACKBOX_API_URL="http://localhost:9115"
ADMIN_GROUPS="status-admin_AppGrpU" # Separated by a comma without space, like "<group_name>_AppGrpU,<group_name_2>_AppGrpU"
```

Then, replace and fill variables with correct values.

>[!NOTE]
> All theses secrets can be find to the team `epfl_status` folder in keybase (`secrets.yaml` file)

| Variable | Description |
| --- | --- |
| **AUTH_SECRET** | Change with a random secret for Auth.js session encryption (`openssl rand -base64 32`) |
| **ENTRA_ID** | Change with EntraID application (client) ID |
| **ENTRA_SECRET** | Change with EntraID client secret |
| **ENTRA_ISSUER** | Change `<tenant-id>` with your tenant id in `https://login.microsoftonline.com/<tenant-id>/v2.0** |
| **PROMETHEUS_API_URL** | Change only on test / prod environment. Keep it with devkit usage |
| **ALERTMANAGER_API_URL** | Change only on test / prod environment. Keep it with devkit usage |
| **BLACKBOX_API_URL** | Change only on test / prod environment. Keep it with devkit usage |
| **ADMIN_GROUPS** | Don't need to be changes since this group exist |


## Launch Web Application (dev mode)

Finally, you can install all dependencies and start the web application by using theses commands.

```sh
cd .. # Go back to the root of the project if you're not yet
bun install
bun dev
```

You can open and use the web application at [http://localhost:3000](http://localhost:3000).

# Launch unit test

# Deploy with Kubernetes
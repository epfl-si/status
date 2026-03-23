<!-- Using "Markdwon all ine one" extension. Put after theses lines, ctrl + shift + p and write "Markdown" and click to "Markdwon all ine one: Create Table of Contents". Auto-reload while saving -->
- [Setup](#setup)
  - [Grafana](#grafana)
    - [Import Dashboard to test your config](#import-dashboard-to-test-your-config)
      - [Import a Dashboard](#import-a-dashboard)
      - [Node Exporter](#node-exporter)
      - [Blackbox Exporter](#blackbox-exporter)
  - [Alertmanager](#alertmanager)
    - [Send alert in telegram using alertmanager](#send-alert-in-telegram-using-alertmanager)


# Setup

## Grafana

### Import Dashboard to test your config

#### Import a Dashboard

1. Go to http://localhost:3030
2. Go to /dashboards
3. At the top right corner, click to "New" and "Import"
4. In Field with placeholder "Grafana.com dashboard URL or ID" or similar, paste id in next step, and after that, click first to the load button next to it and  to Import

#### Node Exporter

id : 1860
Link : https://grafana.com/grafana/dashboards/1860-node-exporter-full/

#### Blackbox Exporter

id : 7587
Link : https://grafana.com/grafana/dashboards/7587-prometheus-blackbox-exporter/

## Alertmanager

### Send alert in telegram using alertmanager

For this, you need to first create a Telegram bot

1. Message @BotFather in Telegram
2. /newbot
3. Write the name's bot (display name)
4. Write the username's bot (name to add to group, unique name)
5. Copy the token and keep it

Next, you need to create a group if you doesn't have already. If you already have one, bump to step 4. of the following steps

1. Click to the menu burger (3 rows icons at the corner)
2. Click to "New Group"
3. Give a name
4. Add your bot previously created using its username
5. After group creation, add @getidsbot to your group (it doesn't need to watch your previous message)
6. It will send a message with your chat id, keep it
7. Optionnaly, you can remove @getidsbot bot if you ensure to keep the chat id

After the bot is created and the group too

1. Go to `devkit/alertmanager` and rename `config.yml.example` to `config.yml`
2. Replace `bot_token` by your bot token value claimed before
3. Replace `chat_id` by your group id
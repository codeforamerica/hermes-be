# hermes-be

Backend code for Hermes (including DB migrations, REST API, cron scripts, etc.)

## Development setup (on Mac OS X 10.8)

### Pre-requisites
   * [Node.js](http://nodejs.org/) is installed.
   * [PostgreSQL server](http://postgresapp.com/) is installed and running.
   * This repository is cloned to a folder on your computer. The rest of this document will refer to this folder as $PROJECT_ROOT.

### One-time setup

1) Install project dependencies.

    cd $PROJECT_ROOT
    npm install

### To run the REST API

1) Start the REST API server.

    cd $PROJECT_ROOT
    node server.js

### To update court dates from CourtNet

1) Run the Court Date Updater script.

    cd $PROJECT_ROOT
    node bin/court_date_updater.js

### To send SMS reminders for tomorrow's court dates

1) Run the SMS Reminder script.

    cd $PROJECT_ROOT
    node bin/sms_reminder.js

### Project directory structure

`$PROJECT_ROOT`: Folder to which this repository was cloned.
`$PROJECT_ROOT/bin`: Folder containing executable programs used by cron jobs, for utility purposes, etc.
`$PROJECT_ROOT/conf`: Folder containing configuration files for the application.


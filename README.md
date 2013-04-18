<img src='http://www.aresluna.org/cfa/hermes-be.jpg'>

# hermes-be

Backend code for Hermes (including DB migrations, REST API, cron scripts, etc.)

## Development setup (on Mac OS X 10.8)

### First-time setup

1) Download and install [Node.js](http://nodejs.org/).

2) Download, install and start [PostgreSQL server](http://postgresapp.com/).

3) Clone this repository to a folder on your computer. The rest of this document will refer to this folder as `$PROJECT_ROOT`.

4) Install project dependencies.

    cd $PROJECT_ROOT
    npm install

5) Create the database user. When prompted, enter the password as defined in the [`config/default.js`](https://github.com/codeforamerica/hermes-be/blob/master/config/default.js) file.

    createuser hermes -P

6) Create the database and make the just-created user its owner.

    createdb hermes -O hermes

7) Create the database schema.

    cd $PROJECT_ROOT
    node bin/update_db_schema.js

### Every time you sync $PROJECT_ROOT with the remote GitHub repo

1) Update the project dependencies.

    cd $PROJECT_ROOT
    npm install

2) Update the database schema.

    cd $PROJECT_ROOT
    node bin/update_db_schema.js

### To start the REST API server

1) Start the REST API server.

    cd $PROJECT_ROOT
    node restapi/server.js

### To update court dates from CourtNet

1) Run the Court Date Updater script.

    cd $PROJECT_ROOT
    node bin/court_date_updater.js

### To send SMS reminders for tomorrow's court dates

1) Run the SMS Reminder script.

    cd $PROJECT_ROOT
    node bin/sms_reminder.js

### Project directory structure

`$PROJECT_ROOT`: Folder to which this repository was cloned. <br />
└`bin`: Folder containing executable programs used by cron jobs, for utility purposes, etc. <br />
└`config`: Folder containing configuration files for the application. <br />
└`lib`: Folder containing code shared by various parts of the application. <br />
└`migrations`: Folder containing database schema migrations. <br />
└`models`: Folder containing models that let the application communicate with the data store. <br />
└`restapi`: Folder containing code for the REST API server, resources and documentation. </br />
└`spec`: Folder containing unit tests. <br />
└`templates`: Folder containing template files used by the application to render SMS responses, etc. <br />



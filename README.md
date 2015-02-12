# photo-share-backend

This is a node.js application that supports uploading, downloading and sharing of photos for the photo-share-ionic application.  It uses socket.io as the basis for communication between the client and server.

## Gettings Started

A vagrant setup is available to run the backend in a local development environment.  To get started follow the steps below:

```
vagrant up
vagrant ssh
cd /vagrant
node debug server.js
```

This will get the server running in debug mode which is useful for quick restarts during development and setting breakpoints during debugging.  Commonly used node debug commands include:

c - continue from a debugger stop. It is important to note that when starting the application with node debug it will automatically stop on the first line and you will need to use this command to get the application fully running.

restart - reloads the applications with the latest changes and starts the application.  You will need to use the continue command to get the application running.

repl - used to evaluate variables, etc during debugging.

## Deployment

Current the production environment for this application is running at Heroku with my nick@unbornconcepts.com account.  The application can be easily deployed to heroku by simply pushing the application via git to heroku.  To setup your environment to support deployment download the heroku toolbelt at (Getting started with Node.js on Heroku)[https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up].  Follow the steps below to get your machine pointed at Heroku:

```
heroku login
cd photo-shared-backend
git remote add heroku https://git.heroku.com/uc-photo-share.git
```

To deploy to Heroku simply

```
git push heroku master
```

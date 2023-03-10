## Local development

Set up first a config file with the environment settings:

    cd functions && firebase functions:config:get -P development > .runtimeconfig.json

Set the project that you want to use:

    firebase use development | foo-bar
    
Go to the functions directory and run the following 2 commands in the terminal, the first to emulate the functions, the second to transpile typescript to javascript.

    firebase emulators:start --only functions
    tsc --watch

## Environment variables

To list all environment variables:

    firebase functions:config:get

To set an environment variable:

    firebase -P simpleDocs|default functions:config:set api.firebase_region=europe-west3

## Deployment

To apply the changes to firestore, go to the functions directory and run:

    npm run build

Then go to the project root and deploy it on firebase:

    firebase deploy --only functions:appApi -P development
    firebase deploy --only functions:appApi -P foo-bar # customer specific

## Local development

Go to the functions directory and run the following 2 commands in the terminal, the first to emulate the functions, the second to transpile typescript to javascript.

    firebase emulators:start --only functions
    tsc --watch

## Deployment

To apply the changes to firestore, go to the functions directory and run:

    npm run build

Then go to the project root and deploy it on firebase:

    firebase deploy # all functions
    firebase deploy --only functions:keepFunctionsWarmCron  # single function
## Local development

Run the following 2 commands in the terminal, the first to emulate the functions, the second to transpile typescript to javascript.

    firebase emulators:start --only functions
    tsc --watch

## Deployment

To apply the changes to firestore, run the following command:

    firebase deploy
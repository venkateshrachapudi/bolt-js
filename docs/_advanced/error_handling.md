---
title: Handling errors
lang: en
slug: error-handling
order: 1
---

<div class="section-content">
*Note: Since v2, error handling has improved! View the [migration guide for V2](https://slack.dev/bolt/tutorial/migration-v2) to learn about the changes.*

If an error occurs in a listener, it’s recommended you handle it directly with a `try`/`catch`. However, there still may be cases where errors slip through the cracks. By default, these errors will be logged to the console. To handle them yourself, you can attach a global error handler to your app with the `app.error(fn)` method.
</div>

```javascript
app.error((error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error);
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">Accessing more data in the error handler</h4>
</summary>

<div class="secondary-content" markdown="0">
There may be cases where you need to log additional data from a request in the global error handler. Or you may simply wish to have access to the `logger` you've passed into Bolt. 

Starting with version 3.8.0, when passing `extendedErrorHandler: true` to the constructor, the error handler will receive an object with `error`, `logger`, `context`, and the `body` of the request.    

It is recommended to check whether a property exists on the `context` or `body` objects before accessing its value, as the data available in the `body` object differs from event to event, and because errors can happen at any point in a request's lifecycle (i.e. before a certain property of `context` has been set).    
</div>

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  extendedErrorHandler: true,
});

app.error(({ error, logger, context, body }) => {
  // Log the error using the logger passed into Bolt
  logger.error(error);

  if (context.teamId) {
    // Do something with the team's ID for debugging purposes
  }
});
```

</details>

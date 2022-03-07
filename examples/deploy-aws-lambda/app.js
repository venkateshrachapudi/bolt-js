const { App, AwsLambdaReceiver } = require('@slack/bolt');
const { createEventAdapter } = require('@slack/events-api');



// Read the port from the environment variables, fallback to 3000 default.
const port = process.env.PORT || 3000;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({

});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,

  // When using the AwsLambdaReceiver, processBeforeResponse can be omitted.
  // If you use other Receivers, such as ExpressReceiver for OAuth flow support
  // then processBeforeResponse: true is required. This option will defer sending back
  // the acknowledgement until after your handler has run to ensure your function
  // isn't terminated early by responding to the HTTP request that triggered it.

  // processBeforeResponse: true
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

// Initialize the adapter to trigger listeners with envelope data and headers
const slackEvents = createEventAdapter(slackSigningSecret, {
  includeBody: true,
  includeHeaders: true,
});

// Listeners now receive 3 arguments
slackEvents.on('message', (event, body, headers) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  console.log(`The event ID is ${body.event_id} and time is ${body.event_time}`);
  if (headers['X-Slack-Retry-Num'] !== undefined) {
    console.log(`The delivery of this event was retried ${headers['X-Slack-Retry-Num']} times because ${headers['X-Slack-Retry-Reason']}`);
  }
});

(async () => {
  const server = await slackEvents.start(port);
  console.log(`Listening for events on ${server.address().port}`);
})();


// Listens for an action from a button click
app.action('button_click', async ({ body, ack, say }) => {
  await ack();
  
  await say(`<@${body.user.id}> clicked the button`);
});

// Listens to incoming messages that contain "goodbye"
app.message('goodbye', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`See ya later, <@${message.user}> :wave:`);
});
// subscribe to 'app_mention' event in your App config
// need app_mentions:read and chat:write scopes
  
app.event("app_mention", async ({ event, client }) => {
  try {
    // directly call the api method 'chat.postMessage'
    const result = await client.chat.postMessage({
      channel: event.channel,
      text: `Welcome , <@${event.user}>!`,
    });
  } catch (error) {
    console.error(error);
  }
});


 // Listen for users opening your App Home
app.event('app_home_opened', async ({ event, client, logger }) => {
  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
        "type": "home",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Welcome home Fam360 App, <@" + event.user + "> :house:*"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Learn how home tabs can be more useful and interactive <https://api.slack.com/surfaces/tabs/using|*in the documentation*>."
            }
          },
           {
          "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Here are the taks you can do  Personal and Profssional appointments \n Work out time \n Grocery shopping list \n Meeting friend at park \n Time taken to commute to work and other places ( google maps integration )\n My phone usage time \nMy sleep time \n Meditation/ mental health time \nFamily time ( sharing spoitify music with friends and family ) \nFinancial health ( mint and other bank summary ) \nHeart and ekg readings \nMedical summary ( prescriptions reminders ,medical reports etc)\nDiet summary \nEntertainment summary \nEducation summary.\n"
                }
    },
    {
      "type": "image",
      "title": {
        "type": "plain_text",
        "text": "image1",
        "emoji": true
      },
      "image_url": "https://d138zd1ktt9iqe.cloudfront.net/media/seo_landing_files/example1-of-pie-charts-1622134105.png",
      "alt_text": "image1"
    },
        ]
      }
    });

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

 
// subscribe to `message.channels` event in your App Config
// need channels:history scope
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  // no need to directly use 'chat.postMessage', no need to include token
  await say({"blocks": [
   {
     "type": "section",
     "text": {
       "type": "mrkdwn",
       "text": `Thanks for the mention <@${message.user}>! Click my fancy button`
     },
     "accessory": {
       "type": "button",
       "text": {
         "type": "plain_text",
         "text": "Button",
         "emoji": true
       },
        "value": "click_me_123",
        "action_id": "first_button"
     }
   }
 ]});
});

// Listen and respond to button click
app.action('first_button', async({action, ack, say}) => {
  // acknowledge the request right away
  await ack();
  await say('Thanks for clicking the fancy button');
});


app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

// Listens to incoming messages that contain "goodbye"
app.message('goodbye', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`See ya later, <@${message.user}> :wave:`);
});

// Listen for a slash command invocation
app.command('/myhealth', async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      // Channel to send message to
      channel: payload.channel_id,
      // Include a button in the message (or whatever blocks you want!)
      blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://joshmartinink.files.wordpress.com/2010/06/work-life-balance-pie-chart1.jpg?w=640',
            alt_text: 'Yay! The modal was updated'
          },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'My Health Summary.'
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Get more on my health details'
            },
            action_id: 'health_button'
          }
        }
      ],
      // Text in the notification
      text: 'Message from Test App'
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});





// Listen for a slash command invocation
app.command('/myworkout', async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    const result = await app.client.views.open({
      token: context.botToken,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: payload.trigger_id,
      // View payload
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'My Workout Details'
        },
        blocks: [
           {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'Hi David, here is your financial activity summary!'
            }
          },
          {
            type: 'image',
            image_url: 'https://images.squarespace-cdn.com/content/v1/5617f7fce4b04192a151a2f0/1501683914447-1SNQ9LWCIMOG2LVSJK6G/image-asset.png?format=1000w',
            alt_text: 'Yay! The modal was updated'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Click for more exciting work out ideas!'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'test_input',
            label: {
              type: 'plain_text',
              text: 'What are your hopes and dreams?'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

// Listen for a button invocation with action_id `button_abc`
// You must set up a Request URL under Interactive Components on your app configuration page
app.action('workout_button', async ({ ack, body, context }) => {
  // Acknowledge the button request
  ack();

  try {
    // Update the message
    const result = await app.client.chat.update({
      token: context.botToken,
      // ts of message to update
      ts: body.message.ts,
      // Channel of message
      channel: body.channel.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Workout button was clicked!*'
          }
        }
      ],
      text: 'Message from Test App'
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

// Listen for a button invocation with action_id `button_abc`
// You must set up a Request URL under Interactive Components on your app configuration page
app.action('health_button', async ({ ack, body, context }) => {
  // Acknowledge the button request
  ack();

  try {
    // Update the message
    const result = await app.client.chat.update({
      token: context.botToken,
      // ts of message to update
      ts: body.message.ts,
      // Channel of message
      channel: body.channel.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Health button was clicked!*'
          }
        }
      ],
      text: 'Message from Test App'
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

// Listen for a slash command invocation
app.command('/mymoney', async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    const result = await app.client.views.open({
      token: context.botToken,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: payload.trigger_id,
      // View payload
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'My Money Details'
        },
        blocks: [
           {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'Hi David, here is your financial activity summary!'
            }
          },
          {
            type: 'image',
            image_url: 'https://www.canr.msu.edu/contentAsset/image/fe1799f0-1d4f-45c0-a46b-20382f177f46/fileAsset/filter/Resize,Jpeg/resize_w/750/jpeg_q/80',
            alt_text: 'Yay! The modal was updated'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'My money summary'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'test_input',
            label: {
              type: 'plain_text',
              text: 'What are your hopes and dreams?'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});


// Listen for a slash command invocation
app.command('/mysummary', async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    const result = await app.client.views.open({
      token: context.botToken,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: payload.trigger_id,
      // View payload
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'My Family Summary '
        },
        blocks: [
           {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'HI David , here is your family overall activities summary!'
            }
          },
          {
            type: 'image',
            image_url: 'https://d138zd1ktt9iqe.cloudfront.net/media/seo_landing_files/example1-of-pie-charts-1622134105.png',
            alt_text: 'Yay! The modal was updated'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'My Family summary'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'test_input',
            label: {
              type: 'plain_text',
              text: 'What are your hopes and dreams?'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

// Listen for a slash command invocation
app.command('/mychill', async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    const result = await app.client.views.open({
      token: context.botToken,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: payload.trigger_id,
      // View payload
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'My Entertainment Details'
        },
        blocks: [

         {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://www.ielts-blog.com/reports/pie-chart-leisure-activities-1999.jpg',
            alt_text: 'Yay! The modal was updated'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Click for more details'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'test_input',
            label: {
              type: 'plain_text',
              text: 'What are your hopes and dreams?'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

// Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
// You must set up a Request URL under Interactive Components on your app configuration page
app.action('button_abc', async ({ ack, body, context }) => {
  // Acknowledge the button request
  ack();

  try {
    const result = await app.client.views.update({
      token: context.botToken,
      // Pass the view_id
      view_id: body.view.id,
      // View payload with updated blocks
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Updated modal'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
            alt_text: 'Yay! The modal was updated'
          }
        ]
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});



// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}

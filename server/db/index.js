require('dotenv').config()
const express = require('express')
const app = express()
const port = 3001
const { getTasks, createTask, deleteTask, updateTask } = require('./queries')
const { MessagingResponse } = require('twilio').twiml;
const cron = require('node-cron');
const { response } = require('express')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

app.use(express.json())
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message('The Robots are coming! Head for the hills!');

  res.type('text/xml').send(twiml.toString());
});

app.get('/', (req, res) => {
  getTasks()
    .then(response => {
      res.status(200).send(response);

    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.post('/tasks', (req, res) => {
  createTask(req.body)
    .then(response => {
      res.status(200).send(response)
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.put('/tasks/:id', (req, res) => {
  updateTask(req.body, req.params.id)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.delete('/tasks/:id', (req, res) => {
  deleteTask(req.params.id)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.post('/api/messages', (req, res) => {
  res.header('Content-Type', 'application/json');
  client.messages
    .create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_NUMBER,
      body: req.body.body
    })
    .then(() => {
      res.send(JSON.stringify({ success: true }));
    })
    .catch(err => {
      console.log(err);
      res.send(JSON.stringify({ success: false }));
    });
});

app.post('/api/cron', (req, res) => {
  res.header('Content-Type', 'application/json');
  let time = req.body.time
  let body = req.body.body
  let name = req.body.id
  console.log(name.stop)

  cron.schedule(time, () => {
    console.log(`'running a test for ${time}'`);
    client.messages
      .create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.MY_NUMBER,
        body: body
      })
      .then(() => {
        res.send(JSON.stringify({ success: true }));
      })
      .catch(err => {
        console.log(err);
        res.send(JSON.stringify({ success: false }));
      });
  }, { name });

  console.log(cron.getTasks())
});



// body has to be on one line for formatting of text
cron.schedule('0 22 * * *', () => {
  console.log(`'running a test for now'`);
  getTasks()
    .then(response => {
      let today = new Date().getDate()
      const tasksCompleted = response.filter(task => task.completed === true && task.date_time.getDate() === today);
      console.log(tasksCompleted.length);
      console.log(today)
      if (tasksCompleted.length !== 0) {
        client.messages
          .create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.MY_NUMBER,
            body: `You completed ${tasksCompleted.length} of your tasks today! May todays success be the beggining of tomorrows achievments`
          })
      } else {
        client.messages
          .create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.MY_NUMBER,
            body: `No feeling is final. feelings of hopelessness dispair or dread wont be what defines the rest of your life and things will get better. there will be a tomorrow, you will be here for it, and the world is a better place with you in it! Please dont be too hard on yourself theres always tomorrow.`
          })
      }
    })
    .catch(error => {
      console.log(error)
    })
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
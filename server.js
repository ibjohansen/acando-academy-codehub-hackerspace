const express = require('express');
const bodyParser = require('body-parser');
const firebase = require("firebase");
const config = require('./appConfig.json');

const fbConfig = config.firebase;

firebase.initializeApp(fbConfig);
firebase.auth().signInAnonymously().catch((error) => {
  console.log(error.code, error.message);
});

const app = express();
app.use(bodyParser.json());

app.set('port', process.env.PORT || config.defaultPort);

//get all items on the people node
app.get('/', (req, res) => {
  res.send('nothing to see here...');
});

//get all items on the people node
app.get('/:app/people', (req, res) => {
  const appId = req.params.app;
  const ref = firebase.database().ref(appId);
  ref.once('value')
    .then((snapshot) => {
      const data = [];
      const peopleData = snapshot.val().people;
      Object.keys(peopleData).map((key) => {
        const person = snapshot.val().people[key];
        person.key = key;
        data.push(person);
      });
      res.send(data);
    });
});

// add item to the people node
app.post('/:app/people/add', (req, res) => {
  const appId = req.params.app;
  const ref = firebase.database().ref(`${appId}/people`);
  ref.push(req.body, (() => res.sendStatus(200)));
});

// update item by id on the people node NOTE -
// this method is using set which will overwrite ALL data on the node,
// see use of «transaction» for a sturdier function
app.put('/:app/people/:id', (req, res) => {
  const appId = req.params.app;
  const id = req.params.id;
  const ref = firebase.database().ref(`${appId}/people/${id}`);
  ref.set(req.body, (() => res.sendStatus(200)));
});

// add or update image on a person
app.put('/:app/people/:id/image', (req, res) => {
  const appId = req.params.app;
  const id = req.params.id;
  const ref = firebase.database().ref(`${appId}/people/${id}/image`);
  ref.set(req.body.imageDataUrl, (() => res.sendStatus(200)));
});

//remove item by id on people node
app.delete('/:app/people/:id', (req, res) => {
  const appId = req.params.app;
  const id = req.params.id;
  const ref = firebase.database().ref(`${appId}/people/${id}`);
  ref.remove()
    .then(() => res.sendStatus(200))
    .catch(function (error) {
      console.log('Remove failed: ' + error.message)
    });
});

app.listen(app.get('port'), () => {
  console.log('server listening on ', app.get('port'));
});
module.exports = app;
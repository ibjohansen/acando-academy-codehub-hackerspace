import express from 'express';
import bodyParser from 'body-parser';
import * as firebase from 'firebase';
import config from '../appConfig.json';

const fbConfig = config.firebase;
const APP_NAME = config.appName;

firebase.initializeApp(fbConfig);
firebase.auth().signInAnonymously().catch((error) => {
  console.log(error.code, error.message);
});

const app = express();
app.use(bodyParser.json());

const isProduction = process.env === 'production';

isProduction && app.set('port', process.env.PORT || config.defaultPort);

//get all items on the people node
app.get('/people', (req, res) => {
  const ref = firebase.database().ref(APP_NAME);
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
app.post('/people/add', (req, res) => {
  const ref = firebase.database().ref(`${APP_NAME}/people`);
  ref.push(req.body, (() => res.sendStatus(200)));
});

// update item by id on the people node NOTE - this method is using set which will overwrite ALL data on the node, see transaction for a sturdier function
app.put('/people/:id', (req, res) => {
  const id = req.params.id;
  const ref = firebase.database().ref(`${APP_NAME}/people/${id}`);
  ref.set(req.body, (() => res.sendStatus(200)));
});

//remove item by id on people node
app.delete('/people/:id', (req, res) => {
  const id = req.params.id;
  const ref = firebase.database().ref(`${APP_NAME}/people/${id}`);
  ref.remove()
    .then(() => res.sendStatus(200))
    .catch(function (error) {
      console.log('Remove failed: ' + error.message)
    });
});

if (isProduction) {
  app.listen(app.get('port'), () => {
    console.log('server listening on ', app.get('port'));
  });
}
export default app;
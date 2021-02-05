const firebase = require("firebase");

const addUser = (req, res) => {
  const { email, nombre, password } = req.body;

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(async (resultado) => {
      const uid = resultado.user.uid;

      console.log(uid);
      await firebase
        .firestore()
        .collection("users")
        .add({ email, nombre, password })
        .catch((e) => console.log(e));
      res.send(resultado.user);
    })
    .catch((e) => {
      res.status(500).send(e);
    });
};
const userLogin = (req, res) => {
  const { email, password } = req.body;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      firebase
        .firestore()
        .collection("users")
        .where("email", "==", email)
        .get()
        .then((snapshot) => {
          const user = [];
          snapshot.forEach((doc) => {
            user.push({ id: doc.id, data: doc.data() });
          });

          res.send(user[0]);
        });
    })
    .catch((e) => {
      res.status(500).send(e);
    });
};
module.exports = { addUser, userLogin };

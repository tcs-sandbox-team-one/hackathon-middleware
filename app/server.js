require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

app.use(express.json());

const user_backend_url = process.env.USER_BACKEND_URL;
const hospital_backend_url = process.env.HOSPITAL_BACKEND_URL;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Middleware server is up and running....");
});

app.post("/book", async (req, res) => {
  const userDetails = req.body.userDetails;
  const hospitalDetails = req.body.hospitalDetails;
  let result = {};

  await fetch(`${hospital_backend_url}/book`, {
    method: "post",
    body: JSON.stringify(hospitalDetails),
    headers: { "Content-Type": "application/json" },
  })
    .then((resp) => resp.json())
    .then((json) => (result.hospital = json))
    .catch((error) => {
      result.error = error;
    });

  await fetch(`${user_backend_url}/book`, {
    method: "post",
    body: JSON.stringify(userDetails),
    headers: { "Content-Type": "application/json" },
  })
    .then((resp) => resp.json())
    .then((json) => (result.user = json))
    .catch((error) => {
      result.error = error;
    });
  console.log(result);
  if (result.user.error || result.hospital.error || result.error)
    res.status(400).send({ statusCode: 400, message: "Could not book!!" });
  else res.status(200).send({ statusCode: 200, message: "Booking success!" });
});

const port = process.env.PORT || 3600;
app.listen(port, () => {
  console.log("Server running on port ", port);
});

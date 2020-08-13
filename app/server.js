const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");

const app = express();
require("dotenv").config();

app.use(express.json());

const user_backend_url = process.env.USER_BACKEND_URL;
const hospital_backend_url = process.env.HOSPITAL_BACKEND_URL;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(cors());

app.get("/", (req, res) => {
  res.send("Middleware server is up and running....");
});

app.get("/health", (req, res) => {
  res.send("health chec is up and running....");
});

app.post("/book", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

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
  else {
    console.log("To", result.user.data.email);
    const text = `Your booking is successful for general room at ${result.hospital.data.hospitalName} with reference ID ${result.hospital.data._id}.`.toString();
    console.log(text);
    const message = {
      to: result.user.data.email,
      from: "chris.hembrom@gmail.com",
      subject: "Booking confirmation",
      text: JSON.stringify(text),
      html: `<h4>Status : Confirmed<h4/><br/> <strong>${text}</strong>`,
    };
    sgMail.send(message).then(
      () => {},
      (error) => {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    );
    res
      .status(200)
      .send({ statusCode: 200, message: "Booking success!", result });
  }
});

const port = process.env.PORT || 3600;
app.listen(port, () => {
  console.log("Server running on port ", port);
});
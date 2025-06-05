const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "moshe212@gmail.com",
    pass: "joldaqzfbjtjwrgt",
  },
});

// CORS Configuration
app.use(
  cors({
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST"],
  })
);

app.post("/sendemail", (req, res) => {
  console.log("req", req.body);
  const { name, email, subject, comments } = req.body;

  let mailOptions = {
    from: email,
    to: "moshe212@gmail.com",
    subject: `New contact from ${name}: ${subject}`,
    text: comments,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.send("error"); // If error occurs, send error response
    } else {
      console.log("Email sent: " + info.response);
      res.send("success"); // If success, send success response
    }
  });
});

app.post("/amadeus", function (req, res) {
  try {
    fetch(
      "https://www.booking1.sellingplatformconnect.amadeus.com/cryptic/apfplus/modules/cryptic/cryptic?&LANGUAGE=US&SITE=MASMMASM&OCTX=OID_tlvi32159",
      {
        headers: {
          accept: "*/*",
          "accept-language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-ch-ua":
            '"Chromium";v="122", "Not(A:Brand";v="24", "Wavebox";v="122"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          cookie:
            'JSESSIONID=uRUuHN8V3CdUp21pZpQ9xIoTlaVvPsVb9tHEDgD6.acs; lss_loc_id=85009E5462C9CCB01E4D34DBCE9D9E6DA5B65E70DEEDFA0DC595047552B2E7AD; visid_incap_2643603=oIxa/A+IQryQaAOPOn0aC0Rz3GUAAAAAQUIPAAAAAACxgWVUe3n+vxEZWbP66HPK; visid_incap_2137601=BtnKKrYFSDSHZ2E+H691f/Jz3GUAAAAAQUIPAAAAAAAmemNDquqQPzf77jP8ukvj; AMCV_10C66EA5532231080A490D44%40AdobeOrg=179643557%7CMCIDTS%7C19786%7CMCMID%7C58923958560268771391767720751921463246%7CMCAAMLH-1710148381%7C6%7CMCAAMB-1710148381%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1709550781s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C5.5.0; um_jst=2FF891108A5F2077F42D87EAAEFCC8852F9EECDEFCADBC24DFBC0730DA025548; nlbi_2643603=6OvVSbi68RegFaJvhm941QAAAAAUpHlgQlZsxweLPc61EoCo; incap_ses_254_2137601=d9lVAvoz9xwpk/B/2GSGA5g552UAAAAAXJgHuFZJ0oT4y6XDFle36w==; 455368185956a8f748fd35f7d905a930=d8363b63bcf9a11e6bee3aae81f7e92e; 5bb6f21dabcc922fce10d96f5b36a932=fb2b3655e133fccb0c8e962ac379cd88; 674ce9d23b31b8a36605b73f0c2e841f=d2849ccee5bc62f16b5ceba3e07bf417; incap_ses_253_2643603=7YNMHbnsUU+WqI1TiNaCA0qR6WUAAAAAAhZXi0g8pC/Nqlf+wdB0pw==; incap_ses_1052_2137601=nuh6Xyt9RE4F8ZX843WZDqyU6WUAAAAAQWBrKGOfBpDSQ6ru95Hh1w==; aria_user_profile={"pref":{"LOGIN_TYPE":"STANDARD","OFFICE_ID":"TLVI32159","ACTIVE_OFFICE_ID":"TLVI32159","IS_GUEST_MODE":false,"AGENT_SIGN":"2009","AGENT_INITIALS":"BS","DUTY_CODE":"SU","USER_ALIAS":"3009922","ORGANIZATION":"NMC-ISRAEL","FIRST_NAME":"BATIA","LAST_NAME":"SERI","PHONE_NUMBER":"+972508943377","LANGUAGE_PREF":"EN","OCTX":"","ENABLE_CUST_NAME":false,"LIST_OFFICES":[{"officeId":"TLVI32159","customName":null}],"is_a_logout":"logout"},"firstName":"","lastName":"","gender":""}; prxCookie=!KUMUxC8R+v+qE7Njs3YwyCFczqp9xlZAfQddeBZpbBjmD4nMx0SBVBtSRuwnaZG0sjzRuY85pwBFwBSjbI/01N+bNttQ2DEBvN/gi6g=',
          Referer:
            "https://www.booking1.sellingplatformconnect.amadeus.com/app_sell2.0/apf/init/login?SITE=LOGINURL&LANGUAGE=US&e=j&OFC=TLVI32159",
          "Referrer-Policy": "origin-when-cross-origin",
        },
        body: "data=%7B%22gds%22%3A%22AMADEUS%22%2C%22isStatelessCloneRequired%22%3Afalse%2C%22tasks%22%3A%5B%7B%22type%22%3A%22CRY%22%2C%22command%22%3A%7B%22command%22%3A%22ANTLVNYC%22%2C%22prohibitedList%22%3A%22SITE_JCPCRYPTIC_PROHIBITED_COMMANDS_LIST_2%22%7D%7D%2C%7B%22type%22%3A%22PAR%22%2C%22parserType%22%3A%22screens.ScreenTypeParser%22%7D%2C%7B%22type%22%3A%22PAR%22%2C%22parserType%22%3A%22screens.ScreenTypeParser%22%7D%2C%7B%22type%22%3A%22ACT%22%2C%22actionType%22%3A%22speedmode.SpeedModeAction%22%2C%22args%22%3A%7B%22argsType%22%3A%22speedmode.SpeedModeActionArgs%22%2C%22obj%22%3A%7B%7D%7D%7D%2C%7B%22type%22%3A%22PAR%22%2C%22parserType%22%3A%22pnr.PnrParser%22%7D%5D%2C%22jSessionId%22%3A%22W0gSnKeugFlk3Ahm8EkNlrSXWnHg6X6pWOP_3nON!1709807349917%22%2C%22contextId%22%3A%222ff891108a5f7830cd62c1adefabf9c67bc6dd8bcd9c84759eed4f619c440079%22%2C%22userId%22%3A%223009922%22%2C%22organization%22%3A%22NMC-ISRAEL%22%2C%22officeId%22%3A%22TLVI32159%22%7D",

        method: "POST",
      }
    )
      .then((response) => response.json()) // Converts the ReadableStream to a JSON object
      .then((data) => {
        console.log(data); // Now you have the actual data
        if (data.model.output.crypticError) {
          console.log(data.model.output.crypticError);
        }
        res.status(200).json({
          response: data.model.output.crypticResponse,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        res.status(400).end();
      });
  } catch (e) {
    console.log("error", e);
    res.status(400).end();
  }
});

// Serve English content
app.use("/en", express.static("./en/"));

// Serve Hebrew content
app.use("/he", express.static("./he/"));

app.use("/v_card", express.static("./v_card/"));

app.get("/", (req, res) => {
  res.redirect("/he");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

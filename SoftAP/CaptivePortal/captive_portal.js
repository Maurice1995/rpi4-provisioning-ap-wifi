const { update_nm_connection, factory_nm_connection, software_reboot, scan_wifi } = require('./utils');
const http_port = 80;
const dev_usrname = "admin";
const dev_password = "admin@123";
const host = "0.0.0.0";
const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');

let app = express();

app.use(express.static(__dirname + '/web'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function renderStatusPage(statusMessage, autoReboot = false) {
  const templatePath = path.join(__dirname, 'web', 'status.html');
  let html = fs.readFileSync(templatePath, 'utf8');
  html = html.replace('{{STATUS_MESSAGE}}', statusMessage);
  html = html.replace('{{AUTO_REBOOT}}', autoReboot.toString());

  if (!autoReboot) {
    // Remove the reboot script if autoReboot is false
    html = html.replace(/<script>[\s\S]*?<\/script>/, '');
  }

  return html;
}

app.listen(http_port, host, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`listen: ${host}:${http_port}`);
  }
});

app.post('/mqtt_credential', function (req, res) {
  res.status(200).send('credential');
});

app.post('/wifi_credential', function (req, res) {
  let ssid = req.body.ssid;
  let password = req.body.password;
  console.log("ssid_wifi = " + ssid + ", password is " + password);
  if ((ssid !== undefined) && (password !== undefined)) {
    if (password.length > 6) {
      update_nm_connection(ssid, password);
      res.send(renderStatusPage("OK and Reboot", true));
      setTimeout(() => {
        software_reboot();
      }, 10000); // Delay reboot by 10 seconds
    } else {
      res.send(renderStatusPage("Password must be greater than 6 characters"));
    }
  } else {
    res.send(renderStatusPage("Invalid SSID or password"));
  }
});

app.post('/wifi_factory_reset', function (req, res) {
    factory_nm_connection();
    res.send(renderStatusPage("OK and Reboot", true));
    setTimeout(() => {
      software_reboot();
    }, 10000); // Delay reboot by 10 seconds
});

app.post('/scan_wifi', function (req, res) {
  scan_wifi().then((ssid_list) => {
    res.status(200).send(ssid_list);
  }).catch((e) => {
    res.status(500).send('Internal Server Error');
  })
});

//  redirect unhandled  request to home
app.get('*', function (req, res) {
  let full_url = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log(full_url)
  res.redirect(302, '/');//  temporary redirect
});

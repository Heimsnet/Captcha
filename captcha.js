/*

    Heimsnet Captcha verification system
    This file is licensed under the following license:
        "EUROPEAN UNION PUBLIC LICENCE v. 1.2" (Abbr. "EUPL-1.2")
        License text available at: https://joinup.ec.europa.eu/sites/default/files/custom-page/attachment/2020-03/EUPL-1.2%20EN.txt

    Licensed under the EUPL.

*/
const axios = require("axios").default;
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./data/config.json');
const Recaptcha = require('express-recaptcha').RecaptchaV3;
const recaptcha = new Recaptcha(config["site-key"], config["secret-key"]);
const app = express();
const port = 3009;

app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.disable('x-powered-by');

app.get('/', (req, res) => {
    if (req.query.id) {
        res.render('index', {
            userid: req.query.id
        });
    }
    else {
        res.render('message', {
            title: 'Error',
            message: 'Missing ?id= GET parameter in URL.'
        });
    }
})

app.post('/verify', recaptcha.middleware.verify, (req, res) => {
    if (!req.recaptcha.error) {
        axios.request({
            method: 'PUT',
            url: `https://discord.com/api/guilds/${config.server}/members/${req.query.id}/roles/${config.role}`,
            headers: {
                Authorization: `Bot ${config.bot_token}`
            }
        }).then(function (response) {
            res.render('message', {
                title: 'Success',
                message: 'Your account has been verified. You can close this window.'
            });
        }).catch(function (error) {
            console.log(error);
            res.render('message', {
                title: 'Could not update user',
                message: `The captcha was verified but your account could not be updated. Please try again!`
            });
        });
    }
    else {
        res.render('error', {
            userid: req.query.id
        });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://127.0.0.1:${port}`);
});
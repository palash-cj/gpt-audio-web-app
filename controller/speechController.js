require('dotenv').config();
const axios=require('axios');
const CircularJSON = require('circular-json');
const path=require('path');
const fs=require("fs");
const API_KEY=process.env.GPT_API_KEY;
const API_URL=process.env.API_URL;

/**
 * home : this function renders the home page of the application
 * @param {*} req 
 * @param {*} res 
 * @returns index page 
 */
const home=(req, res) => {
    if (fs.existsSync('../data.json')) {
        try {
            fs.unlinkSync('../data.json');
        } catch (error) {
            console.error('Error:', error);
        }
    }
    res.render('index');
}

/**
 * ask : this function calls the gpt api and returns the response based on asked question
 * @param {*} req 
 * @param {*} res 
 * @returns answer to the asked question
 */
const ask=async (req, res) => {
    try {
    const content = req.body.content;

    const dataFilePath = path.join(__dirname, '..', 'data.json');

    let data = [];
    if (fs.existsSync('../data.json')) {
        const fileData = fs.readFileSync('../data.json', 'utf8');
        data = JSON.parse(fileData);
    }

    var newMessage={
        role:'user',
        content:content
    }
    data.push(newMessage);
    var updatedData=JSON.stringify(data);
    fs.writeFileSync('../data.json', updatedData, 'utf8', (err) => {
        if (err) {
          console.error('Error creating data.json:', err);
        }
      });


    const messages=fs.readFileSync('../data.json', 'utf8');
    const response = await axios.post(API_URL, {
        model: "gpt-3.5-turbo",
        messages: JSON.parse(messages),
    }, {
        headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        },
    });

    const circularResponse = CircularJSON.stringify(response.data);
    const parsedResponse = CircularJSON.parse(circularResponse);

    if (parsedResponse && parsedResponse.choices && parsedResponse.choices.length > 0) {
        const { content } = parsedResponse.choices[0].message;
        var nextMessage={
            role:'system',
            content:content
        };
        data.push(nextMessage);
        updatedData=JSON.stringify(data);
        fs.writeFileSync('../data.json', updatedData, 'utf8', (err) => {
            if (err) {
              console.error('Error creating data.json:', err);
            }
          });
        res.send(content);
    } else {
        res.status(500).send('Invalid response from API');
    }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(500).send('Error occurred during the request');
    }
}


module.exports={ask, home};
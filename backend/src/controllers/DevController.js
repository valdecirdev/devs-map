const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnection, sendMessage } = require('../websocket');

module.exports = {
    async index (request, response) {
        const devs = await Dev.find();

        return response.json(devs);
    },

    async show (request, response) {
        const { github_username } = request.params;
        const dev = await Dev.findOne({  github_username });

        response.json(dev);
    },

    async store (request, response) {
        const { github_username, techs, latitude, longitude } = request.body;
    
        let dev = await Dev.findOne({ github_username });

        if(!dev){
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
    
            const { name = login, avatar_url, bio } = apiResponse.data;
        
            const techs_array = parseStringAsArray(techs);
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            }
        
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techs_array,
                location,
            });

            const sendSocketMessageTo = findConnection(
                { latitude, longitude },
                techs_array
            );

            sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }

        return response.json(dev);
    },

    async update (request, response) {
        const { github_username } = request.params;
        const { techs, latitude, longitude } = request.body;

        let dev = await Dev.findOne({ github_username });

        if(dev){
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
    
            const { name = login, avatar_url, bio } = apiResponse.data;
        
            const techs_array = parseStringAsArray(techs);
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            }
            
            await dev.update({
                name,
                avatar_url,
                bio,
                techs: techs_array,
                location,
            });
        }

        return response.json(dev);
    },

    async destroy (request, response) {
        const { github_username } = request.params;

        let dev = await Dev.findOne({ github_username });

        if(dev){
            dev.remove();
        }

        response.json({
            'success': true,
        });
    },
}
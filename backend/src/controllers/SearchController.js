const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');

module.exports = {
    async index (request, response) {
        const { latitude, longitude, techs } = request.query;

        const techs_array = parseStringAsArray(techs);

        const devs = await Dev.find({
            techs: {
                $in: techs_array,
            },
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: 10000,
                },
            }
        });

        response.json(devs);
    }
}
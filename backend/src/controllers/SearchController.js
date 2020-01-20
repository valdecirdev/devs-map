const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');

module.exports = {
    async index (request, response) {
        const { latitude, longitude, techs } = request.query;

        const techs_array = parseStringAsArray(techs);

        let devs = [];
        // if(techs_array.lenght > 0){
            devs = await Dev.find({
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
        // } else {
        //     devs = await Dev.find();
        // }

        response.json(devs);
    }
}
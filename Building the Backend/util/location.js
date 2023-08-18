const axios = require("axios");

const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyCHbdLS8RqcniKBKeaVPfXmtPL3HzOGD1E";

const getCoordsForAddress = async (address) => {
	// return {
	// 	lat: 40.7484445,
	// 	lng: -73.9882447,
	// };
	const response = await axios.get(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			address,
		)}&key=${API_KEY}`,
	);

	const data = response.data;

	if (!data || data.status === "ZERO_RESULTS") {
		const error = new HttpError(
			"Could not find location for the specified address.",
			422,
		);
		throw error;
	}

	const coordinates = data.results[0].geometry.location;

	return coordinates;
};

module.exports = getCoordsForAddress;

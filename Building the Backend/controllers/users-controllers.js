const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
	{
		id: "u1",
		name: "Hannah Brog",
		email: "bugsbrog@gmail.com",
		password: "testers",
	},
];

const getUsers = async (req, res, next) => {
	let users;

	try {
		users = await User.find({}, "-password"); // excludes password
	} catch (err) {
		const error = new HttpError("Fetching users failed, please try again later.", 500);
		return next(error);
	}
	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs passed, check your data.", 422));
	}

	const { name, email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError("Sign up failed, please try again later.", 500);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError("User already exists, please login instead.", 422);
		return next(error);
	}

	const createdUser = new User({
		name,
		email,
		image:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
		password,
		places: [],
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError("Signing up failed, please try again.", 500);
		return next(error);
	}

	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;

	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError("Login failed, please try again later.", 500);
		return next(error);
	}

	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError("Invalid credentials, could not log you in.", 401);
		return next(error);
	}

	res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

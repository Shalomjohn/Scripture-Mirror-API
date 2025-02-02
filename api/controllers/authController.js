const User = require('../models/user');
const { sendOTPEmail } = require('../helpers/email_sender');
const EmailList = require('../models/email_list');
const CharacterMatcher = require('../helpers/character_matcher');
const matcher = new CharacterMatcher();

exports.register = async (req, res) => {
  try {

    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "A user already exists with this email address",
      });
    }

    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    });

    // Remove password from output
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};


exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if email and password exist
      if (!email || !password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide email and password'
        });
      }
  
      // Find user by email and explicitly select password
      const user = await User.findOne({ email }).select('+password');
  
      // Check if user exists && password is correct
      if (!user || !(await user.comparePassword(password, user.password))) {
        return res.status(401).json({
          status: 'fail',
          message: 'Incorrect email or password'
        });
      }
  
      // Generate token
      const token = user.generateAuthToken();
  
      // Remove password from output
      user.password = undefined;
  
      res.status(200).json({
        status: 'success',
        token,
        data: {
          user
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
  };


exports.sendEmailOTP = async (req, res) => {
  try {
    let code = Math.floor(1000 + Math.random() * 9000);
    const { email, isSignUp } = req.body;

    if (isSignUp == "true" || isSignUp == true) {

      const user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          status: "error",
          message: "A user already exists with that email address",
        });
      }
    }

    const addToEmailList = async (email, code) => {

      const savedEmail = await EmailList.findOne({ email });

      if (!savedEmail) {
        EmailList.create({ email, otp: code })
      } else {
        savedEmail.otp = code;
        savedEmail.save();
      }
    }

    await sendOTPEmail(email, code);

    addToEmailList(email, code)

    console.log(`OTP code: ${code}`);

    res.json({
      message: 'OTP sent successfully',
      email,
      otp: code,
    });
  } catch (error) {
    console.error(error);
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}

exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const savedEmail = await EmailList.findOne({ email });

    if (!savedEmail) {
      return res.status(400).json({
        message: "No OTP has been sent to this email address",
      });
    }

    if (otp == savedEmail.otp) {
      return res.json({
        status: "success",
        message: 'Email verification successful!',
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: 'OTP incorrect. Check and try again',
      });
    }

  } catch (error) {
    console.error(error);
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}

exports.findMatch = async (req, res) => {
  try {
    const userData = {
      nameMeaning: req.body.nameMeaning,
      virtues: req.body.virtues || [],
      characteristics: req.body.characteristics || []
    };

    const closestMatch = await matcher.findMatch(userData);

    res.status(200).json({
      status: 'success',
      data: closestMatch
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

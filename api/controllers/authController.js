const User = require('../models/user');
const { QuizSubmission } = require('../models/character_quiz_submission');
const { sendOTPEmail } = require('../helpers/email_sender');
const EmailList = require('../models/email_list');
const { findBestMatch, calculateProfile, matchNameMeaning } = require('../helpers/character_matcher');

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

const addToEmailList = async (email, code) => {

  const savedEmail = await EmailList.findOne({ email });

  if (!savedEmail) {
    await EmailList.create({ email, otp: code })
  } else {
    savedEmail.otp = code;
    savedEmail.save();
  }
}


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
    const { quizResponses, nameMeaning, gender } = req.body;

    // Calculate personality profile from quiz responses
    const profile = calculateProfile(quizResponses);

    // Match name meaning to biblical themes
    const nameThemes = matchNameMeaning(nameMeaning);

    // Find best matching character
    const { primaryMatch, alternateMatch, scoreDifference } = findBestMatch(profile, nameThemes, gender);

    // Generate response with explanation and alternatives
    const matchResult = {
      primaryCharacter: {
        name: primaryMatch.name,
        gender: primaryMatch.gender,
        traits: primaryMatch.traits,
        challenges: primaryMatch.challenges,
        explanation: `Based on your responses, you share many qualities with ${primaryMatch.name}. 
        Like ${primaryMatch.name}, you demonstrate ${primaryMatch.traits.join(', ')}. 
        Your approach to leadership and spiritual growth aligns with ${primaryMatch.name}'s 
        ${primaryMatch.leadership} leadership style and ${primaryMatch.spiritualStyle} spiritual journey.`
      },
      alternateCharacter: {
        name: alternateMatch.name,
        gender: alternateMatch.gender,
        traits: alternateMatch.traits,
        explanation: `You also share some characteristics with ${alternateMatch.name}, particularly in terms of 
        ${alternateMatch.traits.slice(0, 2).join(' and ')}.`
      }
    };

    const user = await User.findById(req.user._id);

    const quizResponse = await QuizSubmission.create({ user: req.user._id, gender, nameMeaning, quizResponses, matchResult });
    await quizResponse.save();

    user.bibleMatch = matchResult.primaryCharacter;
    user.save()

    res.json({ matchResult, user });
  } catch (error) {
    res.status(500).json({ error: `Error matching biblical character: ${error}` });
  }
};

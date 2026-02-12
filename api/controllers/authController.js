const User = require('../models/user');
const { QuizSubmission } = require('../models/character_quiz_submission');
const { sendOTPEmail } = require('../helpers/email_sender');
const EmailList = require('../models/email_list');
const { findBestMatch, calculateProfile, matchNameMeaning } = require('../helpers/character_matcher');
const { DailyScripture } = require("../models/daily_scripture");
const { Bookmark } = require('../models/bookmark');

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

exports.deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      await user.deleteOne();

      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
        data: {
          user
        }
      });
      return;
    }
    res.status(500).json({
      status: 'failed',
      message: 'User not found with that email',
    });

    return;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


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

    if(!user) {
      return res.status(500).json({
        status: 'fail',
        message: 'User with email does not exist'
      });
    }

    // Check if user exists && password is correct
    if (!(await user.comparePassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from output
    user.password = undefined;
    var bookmarks = await Bookmark.find({ userId: user._id });
    user.bookmarks = bookmarks;

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

exports.renewToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove password from output
    user.password = undefined;
    const bookmarks = await Bookmark.find({ userId: user._id });
    user.bookmarks = bookmarks;
    const token = user.generateAuthToken();
    return res.json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
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



exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by ID and update the document with the new values
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, // Filter
      { password: password },          // Update
      { new: true }     // Options - return the updated document
    );

    if (!updatedUser) {
      return res.status(404).send(`No user found with email: ${email}`);
    }

    // Send the updated user back to the client
    res.json({
      message: 'Success',
      user: updatedUser,
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


exports.sendEmailOTP = async (req, res) => {
  try {
    let code = Math.floor(1000 + Math.random() * 9000);
    const { email, isSignUp } = req.body;

    const user = await User.findOne({ email });

    if (isSignUp == "true" || isSignUp == true) {
      if (user) {
        return res.status(400).json({
          status: "error",
          message: "A user already exists with that email address",
        });
      }
    } else {
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "No user account exists with that email address",
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

    const profile = calculateProfile(quizResponses);

    const nameThemes = matchNameMeaning(nameMeaning);

    const { primaryMatch, alternateMatches, matchScores } = findBestMatch(profile, nameThemes, gender);

    const matchResult = {
      primaryCharacter: {
        name: primaryMatch.name,
        gender: primaryMatch.gender,
        traits: primaryMatch.traits,
        challenges: primaryMatch.challenges,
        leadership: primaryMatch.leadership,
        spiritualStyle: primaryMatch.spiritualStyle,
        score: primaryMatch.score,
        verseReferences: primaryMatch.verseReferences,
        explanation: primaryMatch.explanation
      },
      alternateMatches,
      matchScores
    };

    const user = await User.findById(req.user._id);

    // Save to match history before updating current match
    if (user.bibleMatch) {
      user.matchHistory.push({
        date: new Date(),
        characterName: user.bibleMatch.name,
        score: user.bibleMatch.score,
        traits: user.bibleMatch.traits,
        challenges: user.bibleMatch.challenges,
        verseReferences: user.bibleMatch.verseReferences,
        matchResult: user.bibleMatch
      });
    }

    // Keep only last 10 matches
    if (user.matchHistory.length > 10) {
      user.matchHistory = user.matchHistory.slice(-10);
    }

    user.bibleMatch = matchResult.primaryCharacter;
    user.bibleMatchAssigned = true;
    await user.save();

    res.json({ matchResult, user });
  } catch (error) {
    res.status(500).json({ error: `Error matching biblical character: ${error}` });
  }
};

exports.addBookmark = async (req, res) => {
  try {
    const { verse, text } = req.body;
    const user = await User.findById(req.user._id);

    // Check if bookmark already exists
    var bookmarkExists = await Bookmark.findOne({ verse: verse, userId: user._id });
    if (bookmarkExists) {
      console.log(bookmarkExists);
      bookmarkExists.date = Date.now();
      await bookmarkExists.save();
      // Return fresh bookmarks from database, not stale user.bookmarks
      const freshBookmarks = await Bookmark.find({ userId: user._id });
      return res.status(200).json({ message: "Bookmark updated", bookmarks: freshBookmarks });
    }

    // Create new bookmark
    const bookmark = await Bookmark.create({ verse, text, userId: user._id });
    
    // Return fresh bookmarks list
    const freshBookmarks = await Bookmark.find({ userId: user._id });
    res.json({ message: "Scripture bookmarked", bookmark, bookmarks: freshBookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.removeBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.body;
    const bookmark = await Bookmark.findByIdAndDelete(bookmarkId);
    if (!bookmark) {
      return res.status(400).json({
        message: "Incorrect Bookmark ID",
      });
    }

    // Add to bookmarks if not already bookmarked
    var bookmarks = await Bookmark.find({ userId: req.user._id });

    res.json({ message: "Successfully removed from bookmarks", bookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

}

// Get bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    var bookmarks = await Bookmark.find({ userId: req.user._id });
    res.json({ bookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Match history methods
exports.getMatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ matchHistory: user.matchHistory || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearMatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.matchHistory = [];
    await user.save();
    res.json({ message: "Match history cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

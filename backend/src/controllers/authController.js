import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user (Customer, Volunteer, or Admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, contactNumber, address, city, role } = req.body;

    if (!name || !email || !password || !contactNumber || !city) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, password, contactNumber, city' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const userRole = role && ['admin', 'volunteer', 'customer'].includes(role) ? role : 'customer';
    const initialStatus = userRole === 'volunteer' ? 'pending' : 'approved';

    const user = await User.create({
      name,
      email,
      password,
      contactNumber,
      address: address || '',
      city,
      role: userRole,
      status: initialStatus,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          address: user.address,
          city: user.city,
          role: user.role,
          status: user.status,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          address: user.address,
          city: user.city,
          role: user.role,
          status: user.status,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          address: user.address,
          city: user.city,
          role: user.role,
          status: user.status,
        },
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.contactNumber = req.body.contactNumber || user.contactNumber;
      user.address = req.body.address !== undefined ? req.body.address : user.address;
      user.city = req.body.city || user.city;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          contactNumber: updatedUser.contactNumber,
          address: updatedUser.address,
          city: updatedUser.city,
          role: updatedUser.role,
          status: updatedUser.status,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

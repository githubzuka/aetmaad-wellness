import Shop from '../models/Shop.js';

/**
 * @desc    Get shops (Filtered by role, zone, or city)
 * @route   GET /api/shops
 * @access  Public / Protected
 */
export const getShops = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    let query = { isActive: true };

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (search) {
      query.name = new RegExp(search, 'i');
    }

    // Role-based contextual filtering
    if (req.user) {
      if (req.user.role === 'volunteer') {
        // Volunteer sees shops in their assigned city or assigned to them
        query = {
          ...query,
          $or: [{ city: new RegExp(req.user.city, 'i') }, { volunteer: req.user._id }],
        };
      }
    }

    const shops = await Shop.find(query)
      .populate('volunteer', 'name email contactNumber city')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: shops.length,
      data: shops,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get shop by ID
 * @route   GET /api/shops/:id
 * @access  Public
 */
export const getShopById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('volunteer', 'name email contactNumber city');

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({
      success: true,
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new shop (Volunteer/Admin)
 * @route   POST /api/shops
 * @access  Private (Admin, Volunteer)
 */
export const createShop = async (req, res, next) => {
  try {
    const { name, address, city, ownerName, contactNumber, owner, contact, phone, volunteerId } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({ message: 'Name, address, and city are required' });
    }

    // If created by a volunteer, assign themselves or specified volunteer if admin
    let assignedVolunteer = null;
    if (req.user.role === 'volunteer') {
      assignedVolunteer = req.user._id;
    } else if (req.user.role === 'admin' && volunteerId) {
      assignedVolunteer = volunteerId;
    }

    const resolvedOwnerName = ownerName || owner || '';
    const resolvedContactNumber = contactNumber || contact || phone || '';

    const shop = await Shop.create({
      name,
      address,
      city,
      ownerName: resolvedOwnerName,
      contactNumber: resolvedContactNumber,
      volunteer: assignedVolunteer,
      lastUpdated: Date.now(),
    });

    const populatedShop = await Shop.findById(shop._id).populate('volunteer', 'name email contactNumber city');

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: populatedShop,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a shop (Updates lastUpdated timestamp)
 * @route   PUT /api/shops/:id
 * @access  Private (Admin, Volunteer)
 */
export const updateShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Check authorization: Volunteer can update if shop is in their zone or assigned to them
    if (req.user.role === 'volunteer') {
      const isAssigned = shop.volunteer && shop.volunteer.toString() === req.user._id.toString();
      const isSameCity = shop.city.toLowerCase() === req.user.city.toLowerCase();

      if (!isAssigned && !isSameCity) {
        return res.status(403).json({ message: 'Not authorized to update shops outside your assigned zone/shop' });
      }
    }

    shop.name = req.body.name || shop.name;
    shop.address = req.body.address || shop.address;
    shop.city = req.body.city || shop.city;
    if (req.body.ownerName !== undefined || req.body.owner !== undefined) {
      shop.ownerName = req.body.ownerName || req.body.owner || shop.ownerName;
    }
    if (req.body.contactNumber !== undefined || req.body.contact !== undefined || req.body.phone !== undefined) {
      shop.contactNumber = req.body.contactNumber || req.body.contact || req.body.phone || shop.contactNumber;
    }
    if (req.body.isActive !== undefined) {
      shop.isActive = req.body.isActive;
    }

    // Always update lastUpdated timestamp on shop updates
    shop.lastUpdated = Date.now();

    await shop.save();

    const updatedShop = await Shop.findById(shop._id).populate('volunteer', 'name email contactNumber city');

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: updatedShop,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Deactivate a shop
 * @route   DELETE /api/shops/:id
 * @access  Private (Admin, Volunteer)
 */
export const deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (req.user.role === 'volunteer') {
      const isAssigned = shop.volunteer && shop.volunteer.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({ message: 'Not authorized to delete shops not assigned to you' });
      }
    }

    await shop.deleteOne();

    res.json({
      success: true,
      message: 'Shop removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

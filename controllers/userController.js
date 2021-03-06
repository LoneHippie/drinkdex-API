const User = require('./../models/userModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/appError');
const factory = require('./handlerFactory');

/////User route handlers

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        };
    });

    return newObj;
};

exports.updateMe = catchAsync (async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for passwords, please try /updateMyPassword', 400));
    }

    const filteredBody = filterObj(req.body, 'username', 'email');

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.addDrink = catchAsync (async (req, res, next) => {
    //update current user savedDrinks field, push query id
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
            $push: { 
                savedDrinks: req.params.id 
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedUser) {
        return next(new AppError('Error, something was not found', 404));
    }; 

    res.status(200).json({
        status: 'success',
        data: {
            data: updatedUser
        }
    });
});

exports.removeDrink = catchAsync (async (req, res, next) => {
    //update current user savedDrinks field, pull query id
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
            $pull: {
                savedDrinks: req.params.id
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedUser) {
        return next(new AppError('Error, something was not found', 404));
    };

    res.status(200).json({
        status: 'success',
        data: {
            data: updatedUser
        }
    });
});

exports.deleteMe = catchAsync (async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined, please use /signup instead'
    });
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User, 'savedDrinks');
exports.updateUser = factory.updateOne(User); //do not use to update pw
exports.deleteUser = factory.deleteOne(User);
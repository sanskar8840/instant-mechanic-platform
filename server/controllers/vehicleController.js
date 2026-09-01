import Vehicle from "../models/Vehicle.js";

export const addVehicle = async (req, res, next) => {
  try {
    const {
      vehicleType,
      brand,
      model,
      registrationNumber,
      fuelType,
      year,
      color,
    } = req.body;

    if (
      !vehicleType ||
      !brand ||
      !model ||
      !registrationNumber ||
      !fuelType ||
      !year
    ) {
      res.status(400);
      throw new Error("Please fill all required vehicle details");
    }

    const existingVehicle = await Vehicle.findOne({
      registrationNumber: registrationNumber.toUpperCase(),
    });

    if (existingVehicle) {
      res.status(400);
      throw new Error("Vehicle with this registration number already exists");
    }

    const vehicle = await Vehicle.create({
      customer: req.user.id,
      vehicleType,
      brand,
      model,
      registrationNumber,
      fuelType,
      year,
      color,
    });

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({
      customer: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehicle not found");
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehicle not found");
    }

    vehicle.vehicleType = req.body.vehicleType || vehicle.vehicleType;
    vehicle.brand = req.body.brand || vehicle.brand;
    vehicle.model = req.body.model || vehicle.model;
    vehicle.registrationNumber =
      req.body.registrationNumber || vehicle.registrationNumber;
    vehicle.fuelType = req.body.fuelType || vehicle.fuelType;
    vehicle.year = req.body.year || vehicle.year;
    vehicle.color = req.body.color ?? vehicle.color;

    const updatedVehicle = await vehicle.save();

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehicle not found");
    }

    await vehicle.deleteOne();

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
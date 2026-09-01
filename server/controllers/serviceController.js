import Service from "../models/Service.js";

export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({
      isActive: true,
    }).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};
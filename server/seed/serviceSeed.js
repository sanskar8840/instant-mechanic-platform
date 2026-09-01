import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Service from "../models/Service.js";

dotenv.config();

const services = [
  {
    name: "Flat Tyre Repair",
    category: "Emergency",
    description: "Tyre puncture or flat tyre roadside assistance.",
    basePrice: 499,
    estimatedMinutes: 30,
    vehicleTypes: ["car", "bike"],
  },
  {
    name: "Battery Jump Start",
    category: "Emergency",
    description: "Battery jump-start service for discharged batteries.",
    basePrice: 599,
    estimatedMinutes: 30,
    vehicleTypes: ["car", "bike"],
  },
  {
    name: "Vehicle Towing",
    category: "Roadside Assistance",
    description: "Towing service when the vehicle cannot be driven.",
    basePrice: 1499,
    estimatedMinutes: 60,
    vehicleTypes: ["car", "bike"],
  },
  {
    name: "Engine Breakdown Assistance",
    category: "Repair",
    description: "Initial diagnosis and roadside help for engine breakdowns.",
    basePrice: 999,
    estimatedMinutes: 60,
    vehicleTypes: ["car", "bike"],
  },
  {
    name: "Oil Change",
    category: "Maintenance",
    description: "Engine oil replacement and basic oil inspection.",
    basePrice: 799,
    estimatedMinutes: 45,
    vehicleTypes: ["car", "bike"],
  },
  {
    name: "General Service",
    category: "Maintenance",
    description: "Basic vehicle inspection and general maintenance service.",
    basePrice: 1299,
    estimatedMinutes: 90,
    vehicleTypes: ["car", "bike"],
  },
];

const seedServices = async () => {
  try {
    await connectDB();

    await Service.deleteMany();

    await Service.insertMany(services);

    console.log(`${services.length} services seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error("Service seed failed:", error.message);
    process.exit(1);
  }
};

seedServices();
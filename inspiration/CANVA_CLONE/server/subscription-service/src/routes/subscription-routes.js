const express = require("express");
const subscriptionController = require("../controllers/subscription-controller");
const paymentController = require("../controllers/payment-controller");

const authenticatedRequest = require("../middleware/auth-middleware");

const router = express.Router();

router.use(authenticatedRequest);

router.get("/", subscriptionController.getSubscription);
router.post("/create-order", paymentController.createOrder);
router.post("/capture-order", paymentController.capturePayment);

module.exports = router;

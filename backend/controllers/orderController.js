const nodemailer = require('nodemailer');
const Order = require('../models/Order');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/orders.json');

// Helper to ensure data directory and file exist
const ensureDataStorage = () => {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2));
  }
};

const getMockOrders = () => {
  try {
    ensureDataStorage();
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading mock orders:', error);
    return [];
  }
};

const saveMockOrder = (order) => {
  try {
    ensureDataStorage();
    const orders = getMockOrders();
    orders.push(order);
    fs.writeFileSync(DATA_PATH, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Error saving mock order:', error);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { email, address, city, zipCode, fullName, paymentMethod, cart, totalAmount } = req.body;

    if (!email || !cart || cart.length === 0) {
      return res.status(400).json({ message: 'Missing email or cart items.' });
    }

    // Save order to DB securely using req.user.id
    const orderData = {
      userId: req.user.id,
      email, address, city, zipCode, fullName, paymentMethod, cart, totalAmount
    };

    let actualOrderId = 'MOCK_ID_' + Date.now();
    let actualCreatedAt = new Date();

    if (req.dbStatus === 'mock') {
      const mockOrder = { ...orderData, _id: actualOrderId, createdAt: actualCreatedAt };
      saveMockOrder(mockOrder);
    } else {
      const newOrder = new Order(orderData);
      const savedDoc = await newOrder.save();
      actualOrderId = savedDoc._id;
      actualCreatedAt = savedDoc.createdAt;
    }

    let transporter;
    
    // If real SMTP credentials are provided in .env, use them
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback: Create a testing account for nodemailer
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    let itemsHtml = cart.map(item => {
      return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
      `;
    }).join('');

    let info = await transporter.sendMail({
      from: `"AIMart Orders" <${process.env.SMTP_USER || 'no-reply@aimart.com'}>`,
      to: email,
      subject: "Order Confirmation and Bill - AIMart",
      html: `
        <div style="font-family: Arial, sans-serif; margin: 0 auto; max-width: 600px;">
          <h2 style="color: #2563eb;">Thank you for your order, ${fullName}!</h2>
          <p>Your order has been placed successfully. Here is your bill:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Grand Total:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; color: #2563eb;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <h3>Shipping Details:</h3>
          <p style="color: #555; background-color: #f8fafc; padding: 16px; border-radius: 8px;">
            ${fullName}<br>
            ${address}<br>
            ${city}, ${zipCode}<br>
            Cash on Delivery
          </p>
          <p>We will email you again once your items ship. If you have any questions, reply to this email.</p>
        </div>
      `,
    });

    console.log("Order Email Sent to %s", email);
    
    // Only prints preview URL if using Ethereal test account
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL: %s", previewUrl);
    }

    res.status(201).json({
      success: true,
      message: 'Order created and email sent successfully.',
      previewUrl: previewUrl || null,
      orderId: actualOrderId,
      createdAt: actualCreatedAt
    });

  } catch (error) {
    console.error('Error in createOrder controller:', error);
    res.status(500).json({ message: 'Server error processing order', error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let rawOrders = [];
    if (req.dbStatus === 'mock') {
      rawOrders = getMockOrders().filter(o => o.userId === req.user.id).reverse();
    } else {
      rawOrders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    }
    
    // Format orders for the frontend
    const formattedOrders = rawOrders.map(o => ({
       id: o._id || o.id,
       date: o.createdAt,
       total: o.totalAmount,
       item: o.cart && o.cart.length > 0 ? o.cart[0] : null
    })).filter(o => o.item !== null);

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
};


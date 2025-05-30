const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// In-memory storage (temporary, just for testing)
const customers = {};

// 👇 TEMP TEST ROUTE - Load Jane Doe for testing
app.get("/send-test", (req, res) => {
  const testPayload = {
    customer_id: "abc123",
    name: "Jane Doe",
    policy_type: "Auto",
    stage: "Quote Completed",
    updated_at: new Date().toISOString()
  };

  customers[testPayload.customer_id] = testPayload;

  console.log("✅ Test customer data loaded.");
  res.send("✅ Test customer data loaded! Go to /abc123 to view it.");
});

// 📩 Webhook endpoint: Zapier will POST here
app.post("/webhook", (req, res) => {
  const { customer_id, name, policy_type, stage, updated_at } = req.body;

  customers[customer_id] = {
    name,
    policy_type,
    stage,
    updated_at
  };

  console.log(`✅ Received update for customer ${customer_id}`);
  res.sendStatus(200); // Respond to Zapier
});

// 🌐 Dashboard endpoint: /customer_id shows status
app.get("/:customer_id", (req, res) => {
  const data = customers[req.params.customer_id];

  if (!data) {
    return res.status(404).send("Customer not found");
  }

  res.send(`
    <html>
      <head>
        <title>Status for ${data.name}</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 40px; }
          h1 { font-size: 28px; }
          .box { background: #f4f4f4; padding: 20px; display: inline-block; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Status for ${data.name}</h1>
          <p><strong>Policy Type:</strong> ${data.policy_type}</p>
          <p><strong>Current Stage:</strong> ${data.stage}</p>
          <p><strong>Last Updated:</strong> ${new Date(data.updated_at).toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome, Spencer to the Customer Status Dashboard!");
});

// 🏁 Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

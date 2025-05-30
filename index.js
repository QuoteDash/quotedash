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
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Status for ${data.name}</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <style>
        body {
          font-family: Arial, sans-serif;
          padding-top: 50px;
          background-color: #f8f9fa;
        }
        .card {
          max-width: 500px;
          margin: auto;
          border-radius: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card shadow p-4">
          <h2 class="mb-4 text-center">Customer Status</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Policy Type:</strong> ${data.policy_type}</p>
          <p><strong>Current Stage:</strong> <span class="badge bg-primary">${data.stage}</span></p>
          <p><strong>Last Updated:</strong> ${new Date(data.updated_at).toLocaleString()}</p>
        </div>
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

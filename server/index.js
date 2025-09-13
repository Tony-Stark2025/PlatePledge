const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// In-memory data stores
let listings = [];
let users = {};

app.use(cors());
app.use(bodyParser.json());

// Welcome message for the root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the PlatePledge backend server!');
});

// --- API Endpoints --- //

// Get all listings
app.get('/api/listings', (req, res) => {
  res.json(listings);
});

// Add a new listing
app.post('/api/listings', (req, res) => {
  const newListing = { id: Date.now(), ...req.body, claimed: false };
  listings.push(newListing);
  res.status(201).json(newListing);
});

// Claim a listing
app.post('/api/listings/:id/claim', (req, res) => {
  const listingId = parseInt(req.params.id, 10);
  const listing = listings.find(l => l.id === listingId);

  if (listing) {
    listing.claimed = true;
    res.json(listing);
  } else {
    res.status(404).send('Listing not found');
  }
});

// User login
app.post('/api/login', (req, res) => {
  const { role } = req.body;
  const user = { id: `user-${Date.now()}`, role };
  users[user.id] = user;
  res.json(user);
});

// Gemini AI Proxy
app.post('/api/gemini', async (req, res) => {
  const { description } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  // Basic validation
  if (!description) {
      return res.status(400).json({ error: 'Description is required' });
  }

  try {
    // Here you would call the actual Gemini API
    // For this example, we'll return a mock response
    const mockResponse = {
        donorName: "Good Samaritan",
        foodType: "Prepared meals",
        quantity: "10 plates"
    };

    res.json(mockResponse);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

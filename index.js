const express = require('express'); 
const dns = require('dns'); 
const cors = require('cors'); 

const app = express();  
const port = process.env.PORT || 3000;  // Use environment port or default to 3000

app.use(cors());  
app.use(express.json());  

// List of known disposable email domains
const disposableDomains = [
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'temp-mail.org',
  'yopmail.com',
  'chainds.com',
];

// POST request to verify email
app.post('/verify', async (req, res) => {
  const { email } = req.body;  
  
  // Basic validation for email format
  if (!email || !email.includes('@')) {
    return res.status(400).json({ valid: false, message: 'Invalid email format' });
  }

  const domain = email.split('@')[1];  // Extract domain from email
  
  // Check if the domain is disposable
  if (disposableDomains.includes(domain)) {
    return res.json({ valid: false, domain, message: 'This is a disposable email address.' });
  }

  // Resolve MX records for the domain
  dns.resolveMx(domain, (err, addresses) => {
    if (err || addresses.length === 0) {
      return res.status(400).json({ valid: false, message: 'Domain does not have MX records' });
    }
    
    // Format MX records for response
    const mxRecords = addresses.map(address => ({
      exchange: address.exchange,
      priority: address.priority,
    }));

    // Return valid response with MX records
    res.json({
      valid: true,
      domain: domain,
      mx: mxRecords,
    });
  });
});

// Start the server on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

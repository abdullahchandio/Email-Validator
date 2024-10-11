const express = require('express');
const dns = require('dns');

const app = express();
const port = 3000;

// List of known disposable email domains
const disposableDomains = [
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'temp-mail.org',
  'yopmail.com',
  'chainds.com', 
  // Add more known disposable domains here
];

// Email verification route
app.get('/verify', async (req, res) => {
  const { email } = req.query;
  // Check if the email is properly formatted
  const domain = email.split('@')[1];
  if (!domain) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  // Check if the domain is in the list of disposable domains
  if (disposableDomains.includes(domain)) {
    return res.json({ valid: false, domain, message: 'This is a disposable email address.' });
  }
  // Check if the domain has MX records (email server records)
  dns.resolveMx(domain, (err, addresses) => {
    if (err || addresses.length === 0) {
      return res.status(400).json({ valid: false, message: 'Domain does not have MX records' });
    }
    const mxRecords = addresses.map(address => ({
      exchange: address.exchange,
      priority: address.priority
    }));

    res.json({
      valid: true,
      domain: domain,
      mx: mxRecords
    });
  });
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

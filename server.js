const express = require('express');
const session = require('express-session');
const path = require('path');
const { sendSMS } = require('./utils/sms');

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: 'demo-session-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit-transaction', (req, res) => {
  const transactionData = {
    accountName: req.body.accountName,
    bankName: req.body.bankName,
    accountNumber: req.body.accountNumber,
    phoneNumber: req.body.phoneNumber,
    amount: req.body.amount,
    narration: req.body.narration,
    transactionDate: req.body.transactionDate,
    referenceNumber: generateDemoReferenceNumber(),
    submittedAt: new Date().toISOString()
  };

  // Save to session
  req.session.transactionData = transactionData;

  // Generate and log SMS simulation
  const smsText = generateDemoSMS(transactionData);
  console.log('\n=== DEMO SMS SIMULATION ===');
  console.log(smsText);
  console.log('=========================\n');

  // Send actual SMS using Africa's Talking API
  if (req.body.phoneNumber) {
    try {
      // Ensure phone number is in E.164 format
      let phoneNumber = req.body.phoneNumber.trim();
      
      // Add +234 if it starts with 0 (Nigerian number)
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+234' + phoneNumber.substring(1);
      }
      // Add + if it starts with 234
      else if (phoneNumber.startsWith('234') && !phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }
      // If it doesn't start with +, assume it needs +234
      else if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+234' + phoneNumber;
      }
      
      console.log(`📱 Sending SMS to: ${phoneNumber}`);
      
      // Send SMS asynchronously (don't wait for response to avoid delays)
      sendSMS(phoneNumber, smsText)
        .then(result => {
          if (result.success) {
            console.log('✅ SMS sent successfully!', result);
          } else {
            console.error('❌ SMS failed:', result.error);
          }
        })
        .catch(error => {
          console.error('❌ SMS sending error:', error);
        });
        
    } catch (error) {
      console.error('❌ Phone number processing error:', error);
    }
  }

  // Redirect to receipt page
  res.redirect('/receipt');
});

app.get('/receipt', (req, res) => {
  if (!req.session.transactionData) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'receipt.html'));
});

app.get('/details', (req, res) => {
  if (!req.session.transactionData) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'details.html'));
});

// API endpoint to get transaction data
app.get('/api/transaction-data', (req, res) => {
  if (!req.session.transactionData) {
    return res.status(404).json({ error: 'No transaction data found' });
  }
  res.json(req.session.transactionData);
});

function generateDemoReferenceNumber() {
  return Math.random().toString(36).substr(2, 12).toUpperCase();
}

function generateDemoSMS(data) {
  const maskedAccount = data.accountNumber.slice(0, 3) + '****' + data.accountNumber.slice(-3);
  const demoBalance = (parseFloat(data.amount) + Math.random() * 50000).toFixed(2);
  
  const date = new Date(data.transactionDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} PM`;

  return `Acct:${maskedAccount}
DT:${formattedDate}
CIP/CR//Transfer from ${data.accountName.toUpperCase()}
CR Amt:${parseFloat(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
Bal:${parseFloat(demoBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
Dial *966# for quick airtime/Data purchase`;
}

app.listen(PORT, () => {
  console.log(`🚀 DEMO Application running on http://localhost:${PORT}`);
  console.log('📝 This is for EDUCATIONAL PURPOSES ONLY');
  console.log('⚠️  All transactions are DEMO simulations');
});
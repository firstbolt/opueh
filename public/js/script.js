// Form validation and SMS preview functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('transactionForm');
    const smsPreview = document.getElementById('smsPreview');
    const smsContent = document.getElementById('smsContent');
    
    // Set default transaction date to current date/time
    const now = new Date();
    const isoString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('transactionDate').value = isoString;
    
    // Form validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return false;
        }
        
        // Show SMS preview
        showSMSPreview();
        
        // Show loading overlay
        document.getElementById('loadingOverlay').classList.remove('hidden');
        
        // Submit form after 4 seconds
        setTimeout(() => {
            form.submit();
        }, 4000);
    });
    
    // Real-time validation feedback
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });
    
    function validateForm() {
        let isValid = true;
        
        // Validate account name
        const accountName = document.getElementById('accountName');
        if (accountName.value.trim().length < 2) {
            showError(accountName, 'DEMO Account name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate bank name
        const bankName = document.getElementById('bankName');
        if (bankName.value.trim().length < 2) {
            showError(bankName, 'DEMO Bank name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate account number
        const accountNumber = document.getElementById('accountNumber');
        if (!/^[0-9]{10}$/.test(accountNumber.value)) {
            showError(accountNumber, 'DEMO Account number must be exactly 10 digits');
            isValid = false;
        }
        
        // Validate phone number
        const phoneNumber = document.getElementById('phoneNumber');
        if (!/^[\+]?[0-9]{10,15}$/.test(phoneNumber.value.replace(/[\s\-\(\)]/g, ''))) {
            showError(phoneNumber, 'Please enter a valid DEMO phone number');
            isValid = false;
        }
        
        // Validate amount - REMOVED LIMIT AS REQUESTED
        const amount = document.getElementById('amount');
        const amountValue = parseFloat(amount.value);
        if (isNaN(amountValue) || amountValue <= 0) {
            showError(amount, 'DEMO Amount must be greater than 0');
            isValid = false;
        }
        
        // Validate narration
        const narration = document.getElementById('narration');
        if (narration.value.trim().length < 1) {
            showError(narration, 'DEMO Narration is required');
            isValid = false;
        }
        
        // Validate transaction date
        const transactionDate = document.getElementById('transactionDate');
        const selectedDate = new Date(transactionDate.value);
        const now = new Date();
        const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        
        if (selectedDate < new Date('2020-01-01') || selectedDate > maxDate) {
            showError(transactionDate, 'DEMO Date must be between 2020 and 30 days from now');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateField(e) {
        const field = e.target;
        clearError(e);
        
        switch (field.id) {
            case 'accountNumber':
                if (!/^[0-9]{10}$/.test(field.value)) {
                    showError(field, 'DEMO Account number must be exactly 10 digits');
                }
                break;
            case 'amount':
                const amount = parseFloat(field.value);
                if (isNaN(amount) || amount <= 0) {
                    showError(field, 'DEMO Amount must be greater than 0');
                }
                break;
        }
    }
    
    function showError(field, message) {
        clearError({target: field});
        
        field.style.borderColor = '#e53e3e';
        field.style.backgroundColor = '#fff5f5';
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.color = '#e53e3e';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '4px';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }
    
    function clearError(e) {
        const field = e.target;
        field.style.borderColor = '#ccc';
        field.style.backgroundColor = '#fff';
        
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
    
    function showSMSPreview() {
        const formData = {
            accountName: document.getElementById('accountName').value,
            bankName: document.getElementById('bankName').value,
            accountNumber: document.getElementById('accountNumber').value,
            amount: parseFloat(document.getElementById('amount').value),
            narration: document.getElementById('narration').value,
            transactionDate: new Date(document.getElementById('transactionDate').value)
        };
        
        const smsText = generateDemoSMS(formData);
        smsContent.textContent = smsText;
        smsPreview.classList.remove('hidden');
        
        // Log to console
        console.log('\n=== DEMO SMS PREVIEW ===');
        console.log(smsText);
        console.log('======================\n');
        
        // Scroll to SMS preview
        smsPreview.scrollIntoView({ behavior: 'smooth' });
    }
    
    function generateDemoSMS(data) {
        const maskedAccount = data.accountNumber.slice(0, 3) + '****' + data.accountNumber.slice(-3);
        const demoBalance = (data.amount + Math.random() * 50000).toFixed(2);
        
        const date = data.transactionDate;
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
    
    // Format account number input (digits only)
    const accountNumberInput = document.getElementById('accountNumber');
    accountNumberInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
    
    // Format phone number input
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 4) {
                value = value;
            } else if (value.length <= 7) {
                value = value.slice(0, 4) + '-' + value.slice(4);
            } else if (value.length <= 11) {
                value = value.slice(0, 4) + '-' + value.slice(4, 7) + '-' + value.slice(7);
            } else {
                value = value.slice(0, 4) + '-' + value.slice(4, 7) + '-' + value.slice(7, 11);
            }
        }
        e.target.value = value;
    });
});

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Prevent form resubmission on page refresh
if (performance.navigation.type === 1) {
    // Page was refreshed
    const url = new URL(window.location);
    if (url.pathname === '/') {
        // Clear any existing form data
        document.getElementById('transactionForm')?.reset();
        const smsPreview = document.getElementById('smsPreview');
        if (smsPreview) {
            smsPreview.classList.add('hidden');
        }
    }
}
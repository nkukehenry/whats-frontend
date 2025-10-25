# Payment Form Frontend Implementation Guide

This guide explains how to implement JPesa payment forms in your frontend application using the WhatsApp API backend.

## Overview

The payment form implementation allows users to pay for subscription plans through JPesa's form-based payment system. This provides a seamless payment experience where users are redirected to JPesa's payment page to complete their transactions.

## API Endpoints

### 1. Register Form Payment

**Endpoint:** `POST /api/v1/payments/register-form-payment`

**Description:** Registers a form-based payment and returns form data for frontend submission to JPesa.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planId": 1,
  "currency": "USD",
  "description": "Premium Plan Subscription",
  "note": "Optional payment note"
}
```

**Parameters:**
- `planId` (required): The ID of the subscription plan
- `currency` (optional): Currency code (defaults to "USD")
- `description` (optional): Payment description
- `note` (optional): Additional payment note

**Note:** The payment amount is automatically taken from the subscription plan's price. This ensures:
- **Security**: Users cannot manipulate payment amounts
- **Consistency**: Payment amounts always match plan prices
- **Simplicity**: Frontend doesn't need to handle amount calculations
- **Accuracy**: No risk of amount mismatches between frontend and backend

**Currency:** All payments are processed in USD. The system automatically handles currency conversion if needed.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Form payment registered successfully",
  "data": {
    "paymentId": 123,
    "ref": "FORM_1234567890_abc123def",
    "planAmount": 5.00,
    "formData": {
      "action": "https://my.jpesa.com/?dad=xp",
      "ownerid": "nkuke.henry",
      "amount": 5.00,
      "cur": "USD",
      "description": "Premium Plan Subscription",
      "return": "https://yourdomain.com/api/v1/payments/return",
      "cancel": "https://yourdomain.com/api/v1/payments/cancel"
    }
  }
}
```

**Response Fields:**
- `paymentId`: Unique payment ID for tracking
- `ref`: Payment reference ID used in JPesa form
- `planAmount`: The actual amount from the subscription plan
- `formData`: Complete form data ready for JPesa submission

**Error Response (400):**
```json
{
  "error": "Plan ID is required"
}
```

### 2. Payment Return Handler

**Endpoint:** `GET /api/v1/payments/return`

**Description:** Handles successful payment returns from JPesa. This endpoint redirects users to your frontend success page.

**Query Parameters:**
- `status`: Payment status (usually "approved")
- `memo`: JPesa memo/credit note number
- `ref`: Payment reference ID

**Example URL:**
```
https://yourdomain.com/api/v1/payments/return?status=approved&memo=12345&ref=FORM_1234567890_abc123def
```

**Behavior:** This endpoint redirects to your frontend success page with the payment parameters.

### 3. Payment Cancel Handler

**Endpoint:** `GET /api/v1/payments/cancel`

**Description:** Handles payment cancellations from JPesa. This endpoint redirects users to your frontend cancel page.

**Query Parameters:**
- `status`: Payment status (usually "cancelled")
- `memo`: JPesa memo/credit note number (optional)
- `ref`: Payment reference ID (optional)

**Example URL:**
```
https://yourdomain.com/api/v1/payments/cancel?status=cancelled&memo=&ref=
```

**Behavior:** This endpoint redirects to your frontend cancel page.

### 4. Form Payment Callback

**Endpoint:** `POST /api/v1/payments/form-callback`

**Description:** Receives payment status updates from JPesa. This is called automatically by JPesa when payment status changes.

**Query Parameters:**
- `status`: Payment status ("approved", "failed", "cancelled")
- `memo`: JPesa memo/credit note number
- `ref`: Payment reference ID
- `amount`: Payment amount (optional)

**Example Callback:**
```
POST https://yourdomain.com/api/v1/payments/form-callback?status=approved&memo=12345&ref=FORM_1234567890_avatar123&amount=5000
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment completed successfully"
}
```

## JPesa Form Structure

The actual JPesa form follows this exact structure:

```html
<form name="JPesa" method="post" action="https://my.jpesa.com/?dad=xp">
  <input type="hidden" name="ownerid" value="nkuke.henry" />
  <input type="hidden" name="description" value="Bulkoms Payment" />
  <input type="hidden" name="return" value="https://my.jpesa.com" />
  <input type="hidden" name="cancel" value="https://my.jpesa.com" />
    "return": "https://yourdomain.com/api/v1/payments/return",
      "cancel": "https://yourdomain.com/api/v1/payments/cancel"
  <select name="cur">
    <option value="USD">USD</option>
  </select>
  <input name="amount" type="text" size="15" />
  <input type="submit" name="pay" value="Make Payment" />
</form>
```

**Key Points:**
- **Form name**: Must be "JPesa"
- **Action**: Always "https://my.jpesa.com/?dad=xp"
- **Currency**: Select dropdown with UGX, KES, USD options
- **Amount**: Text input field
- **No callback or ref fields**: JPesa doesn't support these in the form
- **Return/Cancel URLs**: Point to your application's payment handlers

**Important Note**: Since JPesa doesn't support callback or reference fields in the form, payment tracking is handled differently:
- The backend generates a unique `paymentId` for tracking
- The frontend stores this `paymentId` for status checking
- Payment status is monitored through periodic API calls to your backend
- The return/cancel URLs help redirect users back to your application

## Frontend Implementation

### Step 1: Register Payment

```javascript
async function initiatePayment(planId, currency = 'USD', description, note) {
  try {
    const response = await fetch('/api/v1/payments/register-form-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planId,
        currency,
        description,
        note
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Payment registration failed:', error);
    throw error;
  }
}
```

### Step 2: Submit Form to JPesa

The JPesa form has a specific structure. Here's how to create and submit it:

```javascript
async function submitPaymentForm(planId, currency = 'USD', description, note) {
  try {
    // Register the payment with backend
    const paymentData = await initiatePayment(planId, currency, description, note);
    
    // Display the plan amount to user
    console.log(`Payment amount: ${paymentData.planAmount} ${currency}`);
    
    // Create form element (matching actual JPesa form structure)
    const form = document.createElement('form');
    form.name = 'JPesa';
    form.method = 'POST';
    form.action = paymentData.formData.action;
    form.target = '_blank'; // Open in new tab/window
    
    // Add hidden fields
    const hiddenFields = {
      ownerid: paymentData.formData.ownerid,
      description: paymentData.formData.description,
      return: paymentData.formData.return,
      cancel: paymentData.formData.cancel
    };
    
    Object.entries(hiddenFields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });
    
    // Add currency select dropdown
    const currencySelect = document.createElement('select');
    currencySelect.name = 'cur';
    
    // Add currency options
    const currencies = [
      { value: 'UGX', text: 'UGX' },
      { value: 'KES', text: 'KES' },
      { value: 'USD', text: 'USD' }
    ];
    
    currencies.forEach(currency => {
      const option = document.createElement('option');
      option.value = currency.value;
      option.textContent = currency.text;
      if (currency.value === paymentData.formData.cur) {
        option.selected = true;
      }
      currencySelect.appendChild(option);
    });
    
    form.appendChild(currencySelect);
    
    // Add amount input field
    const amountInput = document.createElement('input');
    amountInput.name = 'amount';
    amountInput.type = 'text';
    amountInput.size = '15';
    amountInput.value = paymentData.formData.amount;
    form.appendChild(amountInput);
    
    // Add submit button
    const submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.name = 'pay';
    submitButton.value = 'Make Payment';
    form.appendChild(submitButton);
    
    // Submit form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Show loading message
    showPaymentInProgress(paymentData.paymentId);
    
  } catch (error) {
    console.error('Payment submission failed:', error);
    showErrorMessage('Failed to initiate payment. Please try again.');
  }
}
```

### Alternative: Simple Hidden Form Approach

If you prefer to hide the form fields and submit automatically:

```javascript
async function submitPaymentFormSimple(planId, currency = 'USD', description, note) {
  try {
    // Register the payment with backend
    const paymentData = await initiatePayment(planId, currency, description, note);
    
    // Create form element
    const form = document.createElement('form');
    form.name = 'JPesa';
    form.method = 'POST';
    form.action = paymentData.formData.action;
    form.target = '_blank';
    
    // Add all fields as hidden inputs
    Object.entries(paymentData.formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    
    // Submit form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Show loading message
    showPaymentInProgress(paymentData.paymentId);
    
  } catch (error) {
    console.error('Payment submission failed:', error);
    showErrorMessage('Failed to initiate payment. Please try again.');
  }
}
```

### Step 3: Handle Payment Status

```javascript
function showPaymentInProgress(paymentId) {
  // Show loading modal or redirect to loading page
  const modal = document.createElement('div');
  modal.className = 'payment-modal';
  modal.innerHTML = `
    <div class="payment-content">
      <h3>Processing Payment</h3>
      <p>Please complete your payment on the JPesa page.</p>
      <p>You will be redirected back to this page once payment is complete.</p>
      <div class="spinner"></div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Store payment ID for status checking
  sessionStorage.setItem('pendingPaymentId', paymentId);
}

// Check payment status periodically
function checkPaymentStatus(paymentId) {
  const checkInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/v1/payments/${paymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.data.status === 'COMPLETED') {
        clearInterval(checkInterval);
        showPaymentSuccess();
      } else if (result.data.status === 'FAILED') {
        clearInterval(checkInterval);
        showPaymentFailure();
      }
    } catch (error) {
      console.error('Status check failed:', error);
    }
  }, 5000); // Check every 5 seconds
}
```

### Step 4: Handle Return URLs

```javascript
// On your success page (/payment/success)
function handlePaymentSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const memo = urlParams.get('memo');
  const ref = urlParams.get('ref');
  
  if (status === 'approved') {
    showSuccessMessage('Payment completed successfully!');
    // Redirect to dashboard or subscription page
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
  } else {
    showErrorMessage('Payment was not completed successfully.');
  }
}

// On your cancel page (/payment/cancelled)
function handlePaymentCancel() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  
  showInfoMessage('Payment was cancelled. You can try again anytime.');
  
  // Redirect back to payment page
  setTimeout(() => {
    window.location.href = '/subscription-plans';
  }, 3000);
}
```

### Step 5: Complete Implementation Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Subscription Payment</title>
    <style>
        .payment-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .payment-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            max-width: 400px;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 1rem auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="payment-section">
        <h2>Choose Your Plan</h2>
        
        <div class="plan-card">
            <h3>Premium Plan</h3>
            <p>Unlimited messages, API access</p>
            <p class="price">USD 5.00/month</p>
            <button onclick="payForPlan(1, 'Premium Plan Subscription')">
                Subscribe Now
            </button>
        </div>
    </div>

    <script>
        async function payForPlan(planId, description) {
            try {
                await submitPaymentForm(planId, 'USD', description);
            } catch (error) {
                alert('Payment failed: ' + error.message);
            }
        }

        async function submitPaymentForm(planId, currency, description) {
            const response = await fetch('/api/v1/payments/register-form-payment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    planId,
                    currency,
                    description
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            // Create JPesa form (matching actual structure)
            const form = document.createElement('form');
            form.name = 'JPesa';
            form.method = 'POST';
            form.action = result.data.formData.action;
            form.target = '_blank';
            
            // Add hidden fields
            const hiddenFields = {
                ownerid: result.data.formData.ownerid,
                description: result.data.formData.description,
                return: result.data.formData.return,
                cancel: result.data.formData.cancel
            };
            
            Object.entries(hiddenFields).forEach(([name, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                form.appendChild(input);
            });
            
            // Add currency select
            const currencySelect = document.createElement('select');
            currencySelect.name = 'cur';
            
            ['UGX', 'KES', 'USD'].forEach(curr => {
                const option = document.createElement('option');
                option.value = curr;
                option.textContent = curr;
                if (curr === result.data.formData.cur) {
                    option.selected = true;
                }
                currencySelect.appendChild(option);
            });
            form.appendChild(currencySelect);
            
            // Add amount input
            const amountInput = document.createElement('input');
            amountInput.name = 'amount';
            amountInput.type = 'text';
            amountInput.size = '15';
            amountInput.value = result.data.formData.amount;
            form.appendChild(amountInput);
            
            // Add submit button
            const submitButton = document.createElement('input');
            submitButton.type = 'submit';
            submitButton.name = 'pay';
            submitButton.value = 'Make Payment';
            form.appendChild(submitButton);
            
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
            
            showPaymentInProgress(result.data.paymentId);
        }

        function showPaymentInProgress(paymentId) {
            const modal = document.createElement('div');
            modal.className = 'payment-modal';
            modal.innerHTML = `
                <div class="payment-content">
                    <h3>Processing Payment</h3>
                    <p>Please complete your payment on the JPesa page.</p>
                    <p>You will be redirected back once payment is complete.</p>
                    <div class="spinner"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Check payment status
            checkPaymentStatus(paymentId);
        }

        async function checkPaymentStatus(paymentId) {
            const checkInterval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/v1/payments/${paymentId}/status`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    const result = await response.json();
                    
                    if (result.data.status === 'COMPLETED') {
                        clearInterval(checkInterval);
                        showPaymentSuccess();
                    } else if (result.data.status === 'FAILED') {
                        clearInterval(checkInterval);
                        showPaymentFailure();
                    }
                } catch (error) {
                    console.error('Status check failed:', error);
                }
            }, 5000);
        }

        function showPaymentSuccess() {
            document.querySelector('.payment-modal').innerHTML = `
                <div class="payment-content">
                    <h3 style="color: green;">Payment Successful!</h3>
                    <p>Your subscription has been activated.</p>
                    <button onclick="window.location.href='/dashboard'">
                        Go to Dashboard
                    </button>
                </div>
            `;
        }

        function showPaymentFailure() {
            document.querySelector('.payment-modal').innerHTML = `
                <div class="payment-content">
                    <h3 style="color: red;">Payment Failed</h3>
                    <p>Your payment could not be processed. Please try again.</p>
                    <button onclick="document.body.removeChild(document.querySelector('.payment-modal'))">
                        Try Again
                    </button>
                </div>
            `;
        }
    </script>
</body>
</html>
```

## Environment Variables

Make sure these environment variables are set in your backend:

```env
# JPesa Configuration
JPESA_API_URL=https://my.jpesa.com/api/
JPESA_API_KEY=your_jpesa_api_key
JPESA_OWNER_ID=your_jpesa_owner_id

# Callback URLs
CALLBACK_BASE_URL=https://yourdomain.com
FRONTEND_URL=https://yourfrontend.com
```

## Error Handling

### Common Error Scenarios

1. **Invalid Plan ID**: Plan doesn't exist or is free
2. **Authentication Failed**: Invalid or expired JWT token
3. **Payment Registration Failed**: Backend error during payment creation
4. **JPesa API Error**: External payment provider issues

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

## Security Considerations

1. **Always validate payment amounts** on the backend
2. **Use HTTPS** for all payment-related endpoints
3. **Implement proper authentication** for all payment operations
4. **Validate callback signatures** if JPesa provides them
5. **Store payment references securely** for reconciliation

## Testing

### Test Payment Flow

1. Register a test payment with a small amount
2. Complete payment on JPesa test environment
3. Verify callback is received correctly
4. Check payment status updates in your system

### Test Scenarios

- Successful payment completion
- Payment cancellation by user
- Payment failure due to insufficient funds
- Network timeout scenarios
- Invalid payment references

## Support

For issues with the payment implementation:

1. Check backend logs for error details
2. Verify JPesa API credentials and configuration
3. Ensure all required environment variables are set
4. Test with JPesa's sandbox environment first

## Additional Resources

- [JPesa API Documentation](https://my.jpesa.com/docs)
- [WhatsApp API Documentation](./BOT_API_DOCUMENTATION.md)
- [WebSocket Integration Guide](./WEBSOCKET_INTEGRATION_GUIDE.md)

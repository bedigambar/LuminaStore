import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, MapPin, Package } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Load Stripe (will error gracefully if key is missing/invalid)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const SHIPPING_THRESHOLD = 50;
const SHIPPING_RATE = 9.99;
const TAX_RATE = 0.08;

const CheckoutForm = ({ clientSecret, shippingAddress, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: shippingAddress.name,
          address: {
            line1: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.zip,
            country: shippingAddress.country,
          },
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#f0f0ff',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': { color: '#a0a0c0' },
      },
      invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 style={{ marginBottom: 'var(--space-md)' }}>Payment Details</h3>
      <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
        <CardElement options={cardStyle} />
      </div>
      <button
        id="pay-now-btn"
        type="submit"
        disabled={!stripe || processing}
        className="btn btn-primary btn-full btn-lg"
      >
        {processing ? <span className="spinner" /> : 'Pay Now'}
      </button>
    </form>
  );
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1 = Address, 2 = Payment
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  const [clientSecret, setClientSecret] = useState('');
  const [creatingIntent, setCreatingIntent] = useState(false);

  const shipping = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const tax = totalPrice * TAX_RATE;
  const total = totalPrice + shipping + tax;

  useEffect(() => {
    document.title = 'Checkout LuminaStore';
    if (items.length === 0) navigate('/cart');
  }, [items, navigate]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      toast.error('Please fill in all address fields');
      return;
    }

    setCreatingIntent(true);
    try {
      const { data } = await API.post('/payment/create-intent', { amount: total });
      setClientSecret(data.clientSecret);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const { data } = await API.post('/orders', {
        shippingAddress,
        paymentMethod: 'stripe',
        paymentResult: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
          email_address: user?.email,
        },
      });
      clearCart();
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error('Payment succeeded but order creation failed. Please contact support.');
    }
  };

  // Skip Stripe if keys are missing (demo mode fallback)
  const handleDemoCheckout = async () => {
    try {
      const { data } = await API.post('/orders', {
        shippingAddress,
        paymentMethod: 'cod',
      });
      clearCart();
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order creation failed');
    }
  };

  return (
    <div className="page-content" style={{ paddingTop: 'calc(var(--navbar-h) + var(--space-2xl))' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        <h1 style={{ marginBottom: 'var(--space-2xl)', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-2xl)', alignItems: 'start' }}>
          {/* Main flow */}
          <div>
            {/* Steps indicator */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: step === 1 ? 'var(--primary)' : 'var(--success)' }}>
                <CheckCircle size={20} fill={step === 2 ? 'var(--success)' : 'none'} />
                <span style={{ fontWeight: 600 }}>1. Shipping</span>
              </div>
              <div style={{ flex: 1, height: 2, background: 'var(--border)', margin: 'auto 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: step === 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
                <CreditCard size={20} />
                <span style={{ fontWeight: 600 }}>2. Payment</span>
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleAddressSubmit} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-lg)' }}>
                  <MapPin size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem' }}>Shipping Address</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Full Name</label>
                    <input id="checkout-name" type="text" className="form-input" value={shippingAddress.name} onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Street Address</label>
                    <input id="checkout-street" type="text" className="form-input" value={shippingAddress.street} onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input id="checkout-city" type="text" className="form-input" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State / Province</label>
                    <input id="checkout-state" type="text" className="form-input" value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP / Postal Code</label>
                    <input id="checkout-zip" type="text" className="form-input" value={shippingAddress.zip} onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <select id="checkout-country" className="form-select" value={shippingAddress.country} onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => navigate('/cart')}>Back to Cart</button>
                  <button id="continue-to-payment-btn" type="submit" className="btn btn-primary" disabled={creatingIntent}>
                    {creatingIntent ? <><span className="spinner" /> Processing...</> : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {!import.meta.env.VITE_STRIPE_PUBLIC_KEY ? (
                  <div className="card text-center">
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>💳</div>
                    <h3 style={{ marginBottom: 'var(--space-sm)' }}>Demo Mode Checkout</h3>
                    <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                      Stripe keys are not configured. You can complete this order without processing a real payment.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                      <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                      <button className="btn btn-primary" onClick={handleDemoCheckout} id="demo-checkout-btn">Complete Demo Order</button>
                    </div>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} shippingAddress={shippingAddress} onSuccess={handlePaymentSuccess} />
                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ marginTop: 'var(--space-md)' }}>Back to Address</button>
                  </Elements>
                ) : (
                  <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl)' }}>
                    <div className="spinner spinner-lg" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-h) + var(--space-lg))' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} /> Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', maxHeight: 300, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.product} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://via.placeholder.com/40'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="truncate" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <hr className="divider" style={{ margin: 'var(--space-md) 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-secondary">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-secondary">Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-secondary">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr className="divider" style={{ margin: 'var(--space-sm) 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem' }}>
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

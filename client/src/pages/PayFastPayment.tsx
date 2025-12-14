import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const PayFastPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse query parameters - GoPay Fast returns response here
    const queryParams = new URLSearchParams(location.search);
    const paymentUrl = queryParams.get('paymentUrl');
    const orderId = queryParams.get('orderId');
    const transactionId = queryParams.get('transactionId');

    if (paymentUrl) {
      try {
        console.log('GoPay Fast Payment Redirect:', {
          orderId,
          transactionId,
          hasUrl: !!paymentUrl
        });
        
        // Validate payment URL
        if (!paymentUrl || !paymentUrl.startsWith('http')) {
          throw new Error("Invalid payment URL from GoPay Fast");
        }

        // Redirect directly to GoPay Fast payment URL
        window.location.href = paymentUrl;
      } catch (err) {
        console.error('Error processing GoPay Fast redirect:', err);
        setError(err instanceof Error ? err.message : 'Failed to process payment');
        setLoading(false);
      }
    } else {
      console.error('No payment URL provided');
      setError('No payment URL provided');
      setLoading(false);
    }
  }, [location, navigate]);

  const handleRetry = () => {
    navigate(-1); // Go back to previous page
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Error</h2>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <button 
              onClick={handleRetry} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Redirecting to GoPay Fast</h2>
          <p className="text-muted-foreground">
            Please wait while we redirect you to the secure payment gateway...
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            If you are not redirected automatically within 5 seconds, please click the button below.
          </p>
          <button 
            onClick={handleRetry} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayFastPayment;
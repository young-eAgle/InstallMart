import Navbar from "@/components/Navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqCategories = [
    {
      category: "Installment Plans",
      questions: [
        {
          q: "What installment plans are available?",
          a: "We offer 3-month, 6-month, and 12-month installment plans. All plans divide your total purchase into equal monthly payments."
        },
        {
          q: "Are there any interest charges?",
          a: "Our standard installment plans are completely interest-free. You only pay the original product price divided across your payment schedule."
        },
        {
          q: "Can I change my installment plan after purchase?",
          a: "Unfortunately, installment plans cannot be changed once confirmed. However, you can pay off your balance early at any time."
        },
        {
          q: "What's the minimum purchase for installments?",
          a: "The minimum purchase amount for installment plans is $100. There's no maximum limit."
        }
      ]
    },
    {
      category: "Payments",
      questions: [
        {
          q: "When is my first payment due?",
          a: "Your first payment is due at checkout. Subsequent payments are automatically charged on the same day each month."
        },
        {
          q: "What payment methods are accepted?",
          a: "We accept all major credit cards, debit cards, and digital wallets for installment payments."
        },
        {
          q: "What happens if a payment fails?",
          a: "If a payment fails, we'll send you an email notification immediately. You'll have 5 days to update your payment method before any late fees apply."
        },
        {
          q: "Can I pay off my balance early?",
          a: "Yes! You can pay your remaining balance at any time without penalties or fees through your dashboard."
        }
      ]
    },
    {
      category: "Orders & Shipping",
      questions: [
        {
          q: "When will my order ship?",
          a: "Orders are processed within 1-2 business days and typically arrive within 5-7 business days, regardless of your payment plan."
        },
        {
          q: "Can I return a product bought on installments?",
          a: "Yes, our standard return policy applies. If you return a product, we'll refund all payments made and cancel remaining installments."
        },
        {
          q: "Do I get my product immediately?",
          a: "Yes! You receive your product immediately after the first payment, just like a regular purchase."
        },
        {
          q: "Can I track my order?",
          a: "Absolutely! You'll receive a tracking number via email once your order ships, and you can track it in your dashboard."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "Is my payment information secure?",
          a: "Yes, we use bank-level encryption and never store your full payment details. All transactions are processed through secure payment gateways."
        },
        {
          q: "How do I update my payment method?",
          a: "You can update your payment method anytime in your account settings or dashboard."
        },
        {
          q: "Can I have multiple installment plans at once?",
          a: "Yes, you can have multiple active installment plans for different purchases simultaneously."
        },
        {
          q: "How do I check my payment schedule?",
          a: "Your complete payment schedule is available in your dashboard, showing all upcoming payments and amounts."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our installment plans and services
          </p>
        </section>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((item, qIdx) => (
                  <AccordionItem 
                    key={qIdx} 
                    value={`item-${idx}-${qIdx}`}
                    className="bg-card rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <section className="mt-16 text-center bg-card p-8 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you with any questions or concerns.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </section>
      </main>
    </div>
  );
};

export default FAQ;

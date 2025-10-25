
import Header from '../components/Header';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p>This is the contact page.</p>
      </div>
    </div>
  );
};

export default ContactPage;

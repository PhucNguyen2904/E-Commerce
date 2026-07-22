import { Outlet } from 'react-router-dom';
import { Header } from '../../shared/components/Header';
import { Footer } from '../../shared/components/Footer';
import { ChatWidget } from '../../shared/components/ChatWidget';

export const StorefrontLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

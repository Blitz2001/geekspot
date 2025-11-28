import { Header } from './Header';
import { Footer } from './Footer';
import BottomNav from './BottomNav';

export const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">
                {children}
            </main>
            <Footer />
            <BottomNav />
        </div>
    );
};

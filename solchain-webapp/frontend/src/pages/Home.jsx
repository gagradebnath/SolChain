import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { Link } from 'react-router-dom';
import './Home.css'; // Assuming you have a CSS file for styling

const Home = () => {
    return (
        <div className="home-container">
            <Header />
            <Sidebar />
            <main className="main-content">
                <h1>Welcome to SolChain</h1>
                <p>
                    SolChain is a decentralized solar microgrid platform that enables secure, peer-to-peer energy trading.
                    Join us in transforming the energy landscape and promoting sustainable energy practices.
                </p>
                <h2>Get Started</h2>
                <p>
                    Explore our features and start trading energy today!
                </p>
                <Link to="/dashboard" className="btn">Go to Dashboard</Link>
                <Link to="/trading" className="btn">Explore Trading</Link>
            </main>
        </div>
    );
};

export default Home;
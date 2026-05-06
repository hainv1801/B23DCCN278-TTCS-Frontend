import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import TourCard from '@/components/client/card/tour.card';
import DestinationCard from '@/components/client/card/destination.card';

const HomePage = () => {
    return (
        <div className={`${styles["container"]} ${styles["home-section"]}`}>
            <div className="search-content" style={{ marginTop: 20 }}>
                <SearchClient />
            </div>
            <Divider />
            <DestinationCard />
            <div style={{ margin: 50 }}></div>
            <Divider />
            <TourCard />
        </div>
    )
}

export default HomePage;
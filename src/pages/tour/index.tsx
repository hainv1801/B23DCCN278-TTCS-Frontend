import SearchClient from '@/components/client/search.client';
import { Col, Divider, Row } from 'antd';
import styles from 'styles/client.module.scss';
import TourCard from '@/components/client/card/tour.card';

const ClientTourPage = (props: any) => {
    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <SearchClient />
                </Col>
                <Divider />

                <Col span={24}>
                    <TourCard
                        showPagination={true}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ClientTourPage;
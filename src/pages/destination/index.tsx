import { Col, Row } from 'antd';
import styles from 'styles/client.module.scss';
import DestinationCard from '@/components/client/card/destination.card';

const ClientDestinationPage = (props: any) => {
    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <DestinationCard
                        showPagination={true}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ClientDestinationPage;
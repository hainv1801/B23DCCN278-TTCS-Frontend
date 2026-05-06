import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import TourPage from './tour';
import CategoryPage from './category';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';

const TourTabs = () => {
    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Manage Tours',
            children: <TourPage />,
        },
        {
            key: '2',
            label: 'Manage Categories',
            children: <CategoryPage />,
        },

    ];
    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.TOURS.GET_PAGINATE}
            >
                <Tabs
                    defaultActiveKey="1"
                    items={items}
                    onChange={onChange}
                />
            </Access>
        </div>
    );
}

export default TourTabs;
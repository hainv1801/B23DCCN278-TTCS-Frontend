import { Result } from "antd";
import { useAppSelector } from '@/redux/hooks';
import { useMemo } from 'react';

interface IProps {
    hideChildren?: boolean;
    children: React.ReactNode;
    permission: { method: string, apiPath: string, module: string };
}

const Access = (props: IProps) => {
    const { permission, hideChildren = false, children } = props;
    const permissions = useAppSelector(state => state.account.user.role.permissions);

    // Dùng useMemo thay cho useEffect + useState để tránh vòng lặp vô hạn
    const allow = useMemo(() => {
        if (!permissions?.length) return true;

        const check = permissions.find(item =>
            item.apiPath === permission.apiPath &&
            item.method === permission.method &&
            item.module === permission.module
        );

        return !!check; // Trả về true nếu tìm thấy quyền, false nếu không
    }, [permissions, permission.apiPath, permission.method, permission.module]);

    // Trường hợp 1: Có quyền hoặc đang tắt ACL -> Hiển thị children
    if (allow || import.meta.env.VITE_ACL_ENABLE === 'false') {
        return <>{children}</>;
    }

    // Trường hợp 2: Không có quyền và KHÔNG yêu cầu ẩn form -> Hiện thông báo lỗi 403
    if (!hideChildren) {
        return (
            <Result
                status="403"
                title="Truy cập bị từ chối"
                subTitle="Xin lỗi, bạn không có quyền hạn (permission) truy cập thông tin này"
            />
        );
    }

    // Trường hợp 3: Không có quyền và CÓ yêu cầu ẩn -> Không render gì cả
    return null;
}

export default Access;
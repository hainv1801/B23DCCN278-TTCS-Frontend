import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchTourSchedule } from '@/config/api';
import { ITourSchedule } from '@/types/backend';

// Định nghĩa cấu trúc State lưu trữ trong Redux
interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: ITourSchedule[];
}

// Giá trị mặc định ban đầu
const initialState: IState = {
    isFetching: true,
    meta: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: []
};

// Async Thunk để gọi API lấy danh sách TourSchedule
export const fetchTourSchedule = createAsyncThunk(
    'tourSchedule/fetchTourSchedule',
    async ({ query }: { query: string }) => {
        const response = await callFetchTourSchedule(query);
        return response;
    }
);

export const tourScheduleSlide = createSlice({
    name: 'tourSchedule', // ĐÃ SỬA Ở ĐÂY: Từ 'category' thành 'tourSchedule'
    initialState,
    // Các reducers đồng bộ (nếu cần dùng sau này)
    reducers: {
        // Ví dụ: reset state
        resetScheduleState: (state) => {
            state.isFetching = false;
            state.meta = { page: 1, pageSize: 10, pages: 0, total: 0 };
            state.result = [];
        }
    },
    // Xử lý các trạng thái của Async Thunk (gọi API)
    extraReducers: (builder) => {
        // Khi bắt đầu gọi API
        builder.addCase(fetchTourSchedule.pending, (state) => {
            state.isFetching = true;
        });
        
        // Khi gọi API thành công
        builder.addCase(fetchTourSchedule.fulfilled, (state, action) => {
            state.isFetching = false;
            // Map dữ liệu từ API trả về vào State của Redux
            if (action.payload && action.payload.data) {
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });

        // Khi gọi API thất bại
        builder.addCase(fetchTourSchedule.rejected, (state) => {
            state.isFetching = false;
        });
    },
});

export const { resetScheduleState } = tourScheduleSlide.actions;

export default tourScheduleSlide.reducer;
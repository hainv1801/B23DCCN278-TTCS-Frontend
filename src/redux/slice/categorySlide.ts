import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchAllCategory } from '@/config/api';
import { ICategory } from '@/types/backend';

// Định nghĩa cấu trúc State lưu trữ trong Redux
interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: ICategory[];
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

// Async Thunk để gọi API lấy danh sách Category
export const fetchCategory = createAsyncThunk(
    'category/fetchCategory',
    async ({ query }: { query: string }) => {
        const response = await callFetchAllCategory(query);
        return response;
    }
);

export const categorySlide = createSlice({
    name: 'category',
    initialState,
    // Các reducers đồng bộ (nếu cần dùng sau này)
    reducers: {
        // Ví dụ: reset state
        resetCategoryState: (state) => {
            state.isFetching = false;
            state.meta = { page: 1, pageSize: 10, pages: 0, total: 0 };
            state.result = [];
        }
    },
    // Xử lý các trạng thái của Async Thunk (gọi API)
    extraReducers: (builder) => {
        // Khi bắt đầu gọi API
        builder.addCase(fetchCategory.pending, (state) => {
            state.isFetching = true;
        });
        
        // Khi gọi API thành công
        builder.addCase(fetchCategory.fulfilled, (state, action) => {
            state.isFetching = false;
            // Map dữ liệu từ API trả về vào State của Redux
            if (action.payload && action.payload.data) {
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });

        // Khi gọi API thất bại
        builder.addCase(fetchCategory.rejected, (state) => {
            state.isFetching = false;
        });
    },
});

export const { resetCategoryState } = categorySlide.actions;

export default categorySlide.reducer;
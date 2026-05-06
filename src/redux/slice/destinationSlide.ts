import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchDestination } from '@/config/api';
import { IDestination } from '@/types/backend';

// Định nghĩa cấu trúc State cho Destination
interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: IDestination[];
}

// Giá trị khởi tạo
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

// Action thunk để fetch danh sách điểm đến từ API
export const fetchDestination = createAsyncThunk(
    'destination/fetchDestination',
    async ({ query }: { query: string }) => {
        const response = await callFetchDestination(query);
        return response;
    }
);

export const destinationSlide = createSlice({
    name: 'destination',
    initialState,
    reducers: {
        // Reducer để reset trạng thái nếu cần
        resetDestinationState: (state) => {
            state.isFetching = false;
            state.meta = { page: 1, pageSize: 10, pages: 0, total: 0 };
            state.result = [];
        }
    },
    extraReducers: (builder) => {
        // Trạng thái đang gọi API
        builder.addCase(fetchDestination.pending, (state) => {
            state.isFetching = true;
        });
        
        // Trạng thái gọi API thành công
        builder.addCase(fetchDestination.fulfilled, (state, action) => {
            state.isFetching = false;
            if (action.payload && action.payload.data) {
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });

        // Trạng thái gọi API thất bại
        builder.addCase(fetchDestination.rejected, (state) => {
            state.isFetching = false;
        });
    },
});

export const { resetDestinationState } = destinationSlide.actions;

export default destinationSlide.reducer;
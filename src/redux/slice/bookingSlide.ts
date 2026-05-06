import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchBooking } from '@/config/api';
import { IBooking } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IBooking[]
}

// Gọi API lấy danh sách Đơn đặt (Booking)
export const fetchBooking = createAsyncThunk(
    'booking/fetchBooking',
    async ({ query }: { query: string }) => {
        const response = await callFetchBooking(query);
        return response;
    }
)

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

export const bookingSlide = createSlice({
    name: 'booking',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchBooking.pending, (state) => {
            state.isFetching = true;
        })
        builder.addCase(fetchBooking.rejected, (state) => {
            state.isFetching = false;
        })
        builder.addCase(fetchBooking.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })
    },
});

export default bookingSlide.reducer;
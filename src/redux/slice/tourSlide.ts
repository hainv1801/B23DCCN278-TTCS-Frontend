import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchTour } from '@/config/api';
import { ITour } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: ITour[]
}

// Gọi API lấy danh sách Tour
export const fetchTour = createAsyncThunk(
    'tour/fetchTour',
    async ({ query }: { query: string }) => {
        const response = await callFetchTour(query);
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

export const tourSlide = createSlice({
    name: 'tour',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchTour.pending, (state) => {
            state.isFetching = true;
        })
        builder.addCase(fetchTour.rejected, (state) => {
            state.isFetching = false;
        })
        builder.addCase(fetchTour.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })
    },
});

export default tourSlide.reducer;
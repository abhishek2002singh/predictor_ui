import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  
  userFromRank: false,
  userFromCollege: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUserFromRank: (state, action) => {
      state.userFromRank = true
     
    },
    addUserFromCollege: (state, action) => {
      state.userFromCollege = true
     
    },
  
  },
});

export const {
  addUserFromRank,
  addUserFromCollege,
} = userSlice.actions;

export default userSlice.reducer;

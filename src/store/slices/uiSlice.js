import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  toast: {
    show: false,
    message: "",
    type: "info", // success, error, warning, info
  },
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    showToast: (state, action) => {
      state.toast = {
        show: true,
        message: action.payload.message,
        type: action.payload.type || "info",
      };
    },
    hideToast: (state) => {
      state.toast = {
        show: false,
        message: "",
        type: "info",
      };
    },
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  setLoading,
  showToast,
  hideToast,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
